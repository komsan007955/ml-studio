from flask import Flask, request, jsonify
import mysql.connector
import os
import time
from contextlib import contextmanager

app = Flask(__name__)

create_table_queries = [
    (
        "user", 
        """
        CREATE TABLE IF NOT EXISTS user (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(20) UNIQUE,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ),
    (
        "component", 
        """
        CREATE TABLE IF NOT EXISTS component (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(20) UNIQUE,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ),  
    (
        "element", 
        """
        CREATE TABLE IF NOT EXISTS element (
            id INT AUTO_INCREMENT PRIMARY KEY,
            component_id INT,
            ref_name VARCHAR(100),
            elem_name VARCHAR(100),
            description VARCHAR(500),
            parent INT,
            ancestor VARCHAR(100),
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(20),
            modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            modified_by VARCHAR(20),
            version INT,
            CONSTRAINT component_fk
                FOREIGN KEY (component_id)
                REFERENCES component(id)
        )
        """
    ), 
    (
        "operation",
        """
        CREATE TABLE IF NOT EXISTS operation (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ref_name VARCHAR(20),
            name VARCHAR(20) UNIQUE,
            description VARCHAR(500),
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(20),
            modified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            modified_by VARCHAR(20),
            version INT,
            app_id INT
        )
        """
    ),
    (
        "permission",
        """
        CREATE TABLE IF NOT EXISTS permission (
            id INT AUTO_INCREMENT PRIMARY KEY,
            elem_id INT,
            operation_id INT,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(20),
            CONSTRAINT elem_fk
                FOREIGN KEY (elem_id)
                REFERENCES element(id),
            CONSTRAINT operation_fk
                FOREIGN KEY (operation_id)
                REFERENCES operation(id)
        )
        """
    ),
    (
        "user_permission",
        """
        CREATE TABLE IF NOT EXISTS user_permission (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            permission_id INT,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_by VARCHAR(20),
            CONSTRAINT user_fk
                FOREIGN KEY (user_id)
                REFERENCES user(id),
            CONSTRAINT permission_fk
                FOREIGN KEY (permission_id)
                REFERENCES permission(id)
        )
        """
    )
]

insert_row_queries = [
    ("user", "INSERT IGNORE INTO user (name) VALUE ('komsan')"), 
    ("component", "INSERT IGNORE INTO component (name) VALUE ('experiment'), ('model')"), 
    ("operation", "INSERT IGNORE INTO operation (name) VALUE ('view'), ('edit'), ('delete'), ('manage')")
]

db_pool = None


def get_db_connection():
    global db_pool
    if db_pool is None:
        raise Exception("Database pool not initialized!")
    
    return db_pool.get_connection()


def setup_database(conn):
    try:
        cursor = conn.cursor()

        for table_name, query in create_table_queries:
            cursor.execute(query)
            print(f"Table \"{table_name}\" verified/created.")
        
        conn.commit()
    
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    finally:
        if "cursor" in locals(): cursor.close()


def setup_tables(conn):
    try:
        cursor = conn.cursor()

        for table_name, query in insert_row_queries:
            cursor.execute(query)
            print(f"Rows added into \"{table_name}\".")
        
        conn.commit()
    
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    finally:
        if "cursor" in locals(): cursor.close()


def get_component_id(comp_name):
    with get_db_cursor() as cursor:
        query = "SELECT id FROM component WHERE name = %s;"
        cursor.execute(query, (comp_name,))
        res = cursor.fetchone()
    
    return res[0] if res else None


def get_elem_id(elem_name):
    with get_db_cursor() as cursor:
        query = "SELECT id FROM element WHERE elem_name = %s;"
        cursor.execute(query, (elem_name,))
        res = cursor.fetchone()
    
    return res[0] if res else None


def get_permission_id(elem_id, operation_ids):
    if not isinstance(operation_ids, list):
        operation_ids = [operation_ids]
        
    with get_db_cursor() as cursor:
        format_strings = ','.join(['%s'] * len(operation_ids))
        query = f"SELECT id FROM permission WHERE elem_id = %s AND operation_id IN ({format_strings});"
        cursor.execute(query, [elem_id] + operation_ids)
        res = cursor.fetchall()
    
    return [r[0] for r in res] if res else []


def get_user_permission_id(user_id, permission_ids):
    if not isinstance(permission_ids, list):
        permission_ids = [permission_ids]
        
    with get_db_cursor() as cursor:
        format_strings = ','.join(['%s'] * len(permission_ids))
        query = f"SELECT id FROM user_permission WHERE user_id = %s AND permission_id IN ({format_strings});"
        cursor.execute(query, [user_id] + permission_ids)
        res = cursor.fetchall()
    
    return [r[0] for r in res] if res else []


def insert_element(comp_id, elem_name, user_id):
    with get_db_cursor() as cursor:
        cursor.execute("INSERT INTO element (component_id, elem_name, created_by) VALUES (%s, %s, %s);", (comp_id, elem_name, user_id))
    return get_elem_id(elem_name)


def insert_permission(elem_id, operation_id):
    ops = operation_id if isinstance(operation_id, list) else [operation_id]
    
    with get_db_cursor() as cursor:
        values_template = ",".join(["(%s, %s)"] * len(ops))
        query = f"INSERT INTO permission (elem_id, operation_id) VALUES {values_template};"
        
        params = []
        for op in ops:
            params.extend([elem_id, op])
            
        cursor.execute(query, params)
    
    return get_permission_id(elem_id, ops)


def insert_user_permission(user_id, permission_id):
    pms = permission_id if isinstance(permission_id, list) else [permission_id]
    
    with get_db_cursor() as cursor:
        values_template = ",".join(["(%s, %s)"] * len(pms))
        query = f"INSERT INTO user_permission (user_id, permission_id) VALUES {values_template};"
        
        params = []
        for pm in pms:
            params.extend([user_id, pm])
            
        cursor.execute(query, params)
    
    return get_user_permission_id(user_id, pms)


@contextmanager
def get_db_cursor():
    conn = get_db_connection() 
    cursor = conn.cursor(buffered=True)
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


@app.route("/")
def index():
    try:
        with get_db_cursor() as cursor:
            cursor.execute("SELECT DATABASE();")
            db_name = cursor.fetchone()
            
        return f"Connected to database: {db_name[0]}"

    except Exception as e:
        return f"Connection failed: {str(e)}", 500


@app.route("/api/user_permission", methods=["GET"])
def get_user_permission():
    user_id = request.args.get("user_id")
    elem_id = request.args.get("elem_id")
    operation_name = request.args.get("operation_name")

    with get_db_cursor() as cursor:
        query = """
            SELECT op.name
            FROM permission p
            INNER JOIN user_permission up ON p.id = up.permission_id
            INNER JOIN operation op ON p.operation_id = op.id
            WHERE up.user_id = %s AND p.elem_id = %s AND op.name = %s;
        """
        cursor.execute(query, (user_id, elem_id, operation_name))
        res = cursor.fetchone()

    return jsonify({
        "has_permission": bool(res),
        "user_id": user_id, 
        "elem_id": elem_id, 
        "operation_name": operation_name
    }), 200


@app.route("/api/add_element", methods=["POST"])
def add_element():
    data = request.json or {}
    comp_name = data.get("component_name")
    elem_name = data.get("elem_name")
    user_id = data.get("user_id")

    if not comp_name or not elem_name or not user_id:
        return jsonify({"error": "'component_name', 'elem_name', and 'user_id' are required"}), 400
    
    comp_id = get_component_id(comp_name)
    
    if comp_id is None:
        return jsonify({"error": f"Component '{comp_name}' not found"}), 404
    
    elem_id = insert_element(comp_id, elem_name, user_id)
    permission_id = insert_permission(elem_id, list(range(1, 5)))
    user_permission_id = insert_user_permission(user_id, permission_id)

    return jsonify({
        "component_name": comp_name, 
        "elem_name": elem_name, 
        "user_id": user_id, 
        "elem_id": elem_id, 
        "permission_id": permission_id, 
        "user_permission_id": user_permission_id
    }), 200


if __name__ == "__main__":
    max_retries = 10
    delay = 5
    
    print("Waiting for database to be ready...")
    for i in range(max_retries):
        try:
            db_pool = mysql.connector.pooling.MySQLConnectionPool(
                pool_name="cerberus_pool",
                pool_size=5, 
                host=os.getenv("MYSQL_HOST", "db"),
                user=os.getenv("MYSQL_USER", "blendata"),
                password=os.getenv("MYSQL_PASSWORD", "l;ylfu=k;F]d1"),
                database=os.getenv("MYSQL_DATABASE", "auth")
            )

            print("Database pool created successfully!")
            break

        except mysql.connector.Error as err:
            print(f"Database not ready (Attempt {i+1}/{max_retries})...")
            time.sleep(delay)
    
    if db_pool:
        conn = get_db_connection()
        try:
            setup_database(conn)
            setup_tables(conn)
        
        finally:
            conn.close()

        print("Starting Flask app...")
        app.run(host="0.0.0.0", port=5000)
    
    else:
        print("CRITICAL: Could not initialize database pool. Exiting.")