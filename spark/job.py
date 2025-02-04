from pyspark.sql import SparkSession

# Create Spark session
spark = SparkSession.builder.appName("ML Studio Job").getOrCreate()

# Load example dataset
df = spark.read.csv("/app/data/example.csv", header=True, inferSchema=True)
df.show()
