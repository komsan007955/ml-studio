from flask import Flask, request, jsonify
import mysql.connector
import os
import time

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
    ("operation", "INSERT IGNORE INTO operation (name) VALUE ('view'), ('edit'), ('manage')")
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

@app.route("/")
def index():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT DATABASE();")
        db_name = cursor.fetchone()
        cursor.close()
        conn.close()
        return f"Connected to database: {db_name[0]}"

    except Exception as e:
        return f"Connection failed: {str(e)}"

@app.route("/api/user_permission", methods=["GET"])
def get_user_permission():
    user_id = request.args.get("user_id")
    elem_id = request.args.get("elem_id")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(f"""
            SELECT name 
            FROM (SELECT * FROM permission WHERE elem_id = {elem_id}) AS permission 
                INNER JOIN 
                    (SELECT * FROM user_permission WHERE user_id = {user_id}) AS user_permission 
                    ON permission.id = user_permission.permission_id
                INNER JOIN operation ON permission.operation_id = operation.id
            ORDER BY modified_date DESC;
        """)
        
        res = cursor.fetchone()
        if res:
            result = res[0]
        else:
            result = None

        cursor.close()
        conn.close()
        
        return jsonify({"status": "success", "user_id": user_id, "elem_id": elem_id, "operation": result}, 200)

    except Exception as e:
        return jsonify({"status": "failed", "user_id": user_id, "elem_id": elem_id, "operation": None}, 404)

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