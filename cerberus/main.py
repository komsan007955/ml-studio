from flask import Flask
import mysql.connector
import os
import time

app = Flask(__name__)

create_table_queries = [
    (
        "component", 
        """
            CREATE TABLE IF NOT EXISTS component (
                id INT AUTO_INCREMENT PRIMARY KEY,
                component_name VARCHAR(20),
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
    )
]

def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "cerberus"),
        user=os.getenv("MYSQL_USER", "blendata"),
        password=os.getenv("MYSQL_PASSWORD", "l;ylfu=k;F]d1"),
        database=os.getenv("MYSQL_DATABASE", "auth")
    )

    return conn

def setup_database():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        for table_name, query in create_table_queries:
            cursor.execute(query)
            print(f"Table \"{table_name}\" verified/created.")
        
        conn.commit()
    
    except mysql.connector.Error as err:
        print(f"Database error: {err}")
    
    finally:
        if "cursor" in locals(): cursor.close()
        if "conn" in locals(): conn.close()

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

if __name__ == "__main__":
    time.sleep(2) 
    setup_database()
    app.run(host="0.0.0.0", port=5000)