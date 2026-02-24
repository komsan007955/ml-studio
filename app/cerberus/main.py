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


@contextmanager
def get_db_cursor():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
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