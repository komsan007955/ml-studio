from flask import Flask
import mysql.connector
import os

app = Flask(__name__)

def get_db_connection():
    # These environment variables will be defined in docker-compose.yml
    conn = mysql.connector.connect(
        host=os.getenv('MYSQL_HOST', 'cerberus'),
        user=os.getenv('MYSQL_USER', 'blendata'),
        password=os.getenv('MYSQL_PASSWORD', 'l;ylfu=k;F]d1'),
        database=os.getenv('MYSQL_DATABASE', 'auth')
    )
    return conn

@app.route('/')
def index():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT DATABASE();')
        db_name = cursor.fetchone()
        cursor.close()
        conn.close()
        return f"Connected to database: {db_name[0]}"
    except Exception as e:
        return f"Connection failed: {str(e)}"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)