import mysql.connector

conn = mysql.connector.connect(
    host="localhost",
    user="blendata",
    password="l;ylfu=k;F]d1",
    database="auth"
)

cursor = conn.cursor()

dict_create_table_query = {
    "component": """
        CREATE TABLE IF NOT EXISTS component (
            id INT AUTO_INCREMENT PRIMARY KEY,
            component_name VARCHAR(20),
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """, 
    "element": """
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
}

try:
    for k, v in dict_create_table_query.items():
        cursor.execute(v)
        print(f"Table {k} created successfully!")
except Exception as e:
    print(f"Error: {e}")
finally:
    cursor.close()