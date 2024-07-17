# -*- coding: utf-8 -*-
"""PatternIdentification_and_InsightGeneration.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1yAYB5ICf4EmRi679CCAjotaQY7sYJspN
"""


class InsightGeneration:

    def __init__(self):
        pass

    save_dir = "/Models/"

    # Save Model
    def save_model(self, model, model_name):
        import os  # To work with the operating system
        import shutil  # To remove the existing directory
        from pathlib import Path  # To work with file paths

        try:
            # Get the current working directory
            current_directory = Path.cwd()

            # Get the parent directory
            parent_directory = current_directory.parent.absolute()

            self.save_dir = os.path.join(parent_directory, "Models\\")

            # Create the full path
            full_path = os.path.join(self.save_dir, model_name)

            # Remove the existing directory if it exists
            if os.path.exists(full_path):
                shutil.rmtree(full_path)

            # Save the model
            model.save(full_path)
            return f"Model Saved At: {full_path}\n"
        except PermissionError as P:
            return f"Permission Denied to Access Specified Path!"
        except Exception:
            return f"Pyspark Error Occured!"

    # K-Means Clustering

    def KMeansClustering(self, df):

        # To Train a clustering model using K-Means Clustering
        from pyspark.ml.clustering import KMeans
        # To Train a Pipeline
        from pyspark.ml import Pipeline
        # To Evaluate a Clustering model using Silhouette Score
        from pyspark.ml.evaluation import ClusteringEvaluator
        # To use some important methods of Numpy
        import numpy as np
        # To Plot Scatter plots for K-Means Clustering
        import matplotlib.pyplot as plt
        import matplotlib
        matplotlib.use('Agg')
        # Inter-cluster Distances
        from scipy.spatial.distance import cdist
        # To Generate Statistics from the dataset in Natural Language
        import google.generativeai as genai
        import io
        import base64

        # Find the optimal K (automatically detect elbow point)
        def find_elbow_point(costs):
            diffs = np.diff(costs)
            second_diffs = np.diff(diffs)
            # +2 to adjust for the two diffs operations
            return np.argmin(second_diffs) + 2

        # Elbow Method to find the optimal K
        cost = []
        silhouette_scores = []
        K_range = range(2, 8)
        for k in K_range:
            kmeans = KMeans(k=k, seed=1)  # Set seed to 1 for reproducibility
            # Create a pipeline with the KMeans model
            pipeline = Pipeline(stages=[kmeans])
            model = pipeline.fit(df)  # Fit the model to the dataset
            # Use summary.trainingCost to get the WSSE
            cost.append(model.stages[-1].summary.trainingCost)

            # Make predictions on the dataset
            predictions = model.transform(df)
            evaluator = ClusteringEvaluator()  # Create an evaluator for clustering
            # Evaluate the model using Silhouette Score
            silhouette_scores.append(evaluator.evaluate(predictions))

        # Finding optimal K based on Silhouette Score
        optimal_k_silhouette = K_range[np.argmax(silhouette_scores)]

        # Fit the KMeans model with the optimal K
        kmeans = KMeans().setK(optimal_k_silhouette).setSeed(1)
        pipeline = Pipeline(stages=[kmeans])
        model = pipeline.fit(df)
        predictions = model.transform(df)

        # Get KMeans model
        kmeans_model = model.stages[-1]
        # self.save_model(kmeans_model, f"kmeans_model_{dp.file_name}")

        # Set the optimal K based on the elbow method
        optimal_k = find_elbow_point(cost)
        centers = kmeans_model.clusterCenters()  # Get the centers of the clusters
        cluster_sizes = predictions.groupBy("prediction").count().orderBy(
            "prediction").collect()  # Get the sizes of each cluster
        # Get the inter-cluster distances
        inter_cluster_distances = cdist(centers, centers, 'euclidean')

        # Giving API Key ro Configure model
        genai.configure(api_key="AIzaSyAfe09bOemDufX_OyYz8qkL1tAPcpdn9WU")

        # Initialize the model
        gemini = genai.GenerativeModel(model_name='gemini-1.5-pro')

        prompt = f"""Represent the following Data in an elegant\
        and comprehensive manner without redundant sentences:\
        optimal k using elbow method is: {optimal_k}, optimal k\
        using silhouette method is: {optimal_k_silhouette}, cluster\
        centers are: {centers}\
        cluster sizes are: {cluster_sizes}\
        and the inter cluster distances are: {inter_cluster_distances}\
        comprehend the data in the matrices in an elegant way\
        rather than showing the matrices\
        the K-means model is trained for k: {optimal_k_silhouette}.\
        Must not bold the Headings but use\
        points and give a newline\
        after every sentence and a newline if\
        a sentence contains for than 15 words."""

        # Generate Content
        response = gemini.generate_content(prompt)

        columns = tuple(df.columns) + ('prediction',)
        # Convert predictions to Pandas DataFrame for plotting
        pandas_df = predictions.select(*columns).toPandas()

        # Plotting the clusters in a grid with 2 plots per row
        num_features = len(columns)
        num_pairs = (((num_features - 2) * (num_features - 1)) // 2) + 2
        num_rows = np.ceil(num_pairs / 2).astype(int)

        fig, axes = plt.subplots(num_rows, 2, figsize=(15, 5 * num_rows))
        fig.subplots_adjust(hspace=0.4, wspace=0.4)

        # Flatten axes array if num_rows == 1
        if num_rows == 1:
            axes = axes.flatten()

        plot_idx = 0

        ax = axes[0, 0]
        # Plotting the results
        ax.plot(K_range, cost, 'bx-')
        ax.set_xlabel('Number of Clusters K')
        ax.set_ylabel('Within Set Sum of Squared Errors (WSSSE)')
        ax.set_title('Elbow Method For Optimal K')
        plot_idx += 1

        ax = axes[0, 1]
        # Plotting the results
        ax.plot(K_range, silhouette_scores, 'bx-')
        ax.set_xlabel('Number of Clusters K')
        ax.set_ylabel('Silhouette Score')
        ax.set_title('Silhouette Score For Optimal K')
        plot_idx += 1

        for feature1 in range(len(columns) - 2):
            for feature2 in range(feature1 + 1, len(columns) - 2):
                row = plot_idx // 2
                col = plot_idx % 2
                ax = axes[row, col] if num_rows > 1 else axes[col]
                ax.scatter(pandas_df[columns[feature1]], pandas_df[columns[feature2]],
                           c=pandas_df['prediction'], cmap='magma')
                ax.set_xlabel(f"{columns[feature1]}")
                ax.set_ylabel(f"{columns[feature2]}")
                ax.set_title(f"KMeans Clustering: {
                             columns[feature1]} vs {columns[feature2]}')
                plot_idx += 1

        # Hide any unused subplots
        for i in range(plot_idx, num_rows * 2):
            axes[i//2][i % 2].set_visible(False)

        plt.tight_layout()

        # Save the plot to a bytes buffer instead of showing it
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plot_data = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)

        return response.text, plot_data

    # Logistic Regression
    def logisticRegression(self, df, label):
        # To Train a Logistic Regression Model
        from pyspark.ml.classification import LogisticRegression
        # To Train a Pipeline
        from pyspark.ml import Pipeline
        # To Evaluate the Logistic Regression Model
        from pyspark.ml.evaluation import MulticlassClassificationEvaluator
        # To Plot graph of Logistic Regression
        import matplotlib.pyplot as plt
        import matplotlib
        matplotlib.use('Agg')
        # To Plot Confusion Matrix
        from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
        # To Generate Statistics from the dataset in Natural Language
        import google.generativeai as genai
        import io
        import base64

        # Define the Logistic Regression model
        lr = LogisticRegression(featuresCol="features",
                                labelCol=label, family="multinomial")

        # Split the data into training and testing sets
        train_data, test_data = df.randomSplit([0.7, 0.3], seed=42)

        # Create a pipeline with the Logistic Regression model
        pipeline = Pipeline(stages=[lr])
        # Train the model
        model = pipeline.fit(train_data)

        # Extract the logistic regression stage from the pipeline model
        lr_model = model.stages[-1]
        # self.save_model(lr_model, f"logistic_regression_model_{dp.file_name}")

        # Evaluate the model
        predictions = model.transform(test_data)
        evaluator = MulticlassClassificationEvaluator(
            labelCol=label, predictionCol="prediction", metricName="accuracy")
        accuracy = evaluator.evaluate(predictions)

        # Additional evaluation metrics
        evaluator.setMetricName("weightedPrecision")
        weighted_precision = evaluator.evaluate(predictions)

        evaluator.setMetricName("weightedRecall")
        weighted_recall = evaluator.evaluate(predictions)

        evaluator.setMetricName("f1")
        f1_score = evaluator.evaluate(predictions)

        # Convert predictions to Pandas DataFrame for plotting
        predictions_pd = predictions.select("prediction", label).toPandas()
        y_true = predictions_pd[label]
        y_pred = predictions_pd["prediction"]

        prompt = f"""Represent the following Data in an elegant\
        and comprehensive manner without redundant sentences:\
        accuracy of the Logistic Regression Model is {accuracy}\
        weighted precision of the model is {weighted_precision}\
        weighted recall of the model is {weighted_recall}\
        f1 score of the model is {f1_score}\
        explain the data in an elegant way\
        rather than showing the matrices\
        Must not bold the Headings but use\
        points and give a newline\
        after every 15 words in a line."""

        # Giving API Key ro Configure model
        genai.configure(api_key="AIzaSyAfe09bOemDufX_OyYz8qkL1tAPcpdn9WU")

        # Initialize the model
        gemini = genai.GenerativeModel(model_name='gemini-1.5-pro')

        # Generate Content
        response = gemini.generate_content(prompt)

        # Plot Confusion Matrix
        conf_matrix = confusion_matrix(y_true, y_pred)
        fig, ax = plt.subplots(figsize=(10, 7))
        ConfusionMatrixDisplay(conf_matrix).plot(ax=ax)
        ax.set_title('Confusion Matrix')

        plt.tight_layout()

        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        plot_data = base64.b64encode(buf.read()).decode('utf-8')
        plt.close(fig)

        return response.text, plot_data

    # Decision Tree Classifier
    def decisionTreeClassifier(self, df, label):
        # To Train a Decision Tree Classifier Model
        from pyspark.ml.classification import DecisionTreeClassifier
        # To Train a Pipeline
        from pyspark.ml import Pipeline
        # To Evaluate the Logistic Regression Model
        from pyspark.ml.evaluation import MulticlassClassificationEvaluator
        # To Generate Statistics from the dataset in Natural Language
        import google.generativeai as genai

        dt = DecisionTreeClassifier(featuresCol="features", labelCol=label)

        # Create pipeline
        pipeline = Pipeline(stages=[dt])

        # Split data into training and test sets
        train_data, test_data = df.randomSplit([0.8, 0.2], seed=1234)

        # Fit the pipeline to training data
        model = pipeline.fit(train_data)

        # Extract the logistic regression stage from the pipeline model
        dt_model = model.stages[-1]
        # self.save_model(dt_model, f"decision_tree_model_{dp.file_name}")

        # Make predictions on test data
        predictions = model.transform(test_data)

        # Evaluate model using accuracy
        evaluator = MulticlassClassificationEvaluator(
            labelCol=label, predictionCol="prediction", metricName="accuracy")
        accuracy = evaluator.evaluate(predictions)

        prompt = f"""Represent the following Data in an elegant\
        and comprehensive manner without redundant sentences:\
        accuracy of the Decision Tree classifier Model is {accuracy},\
        feature importances is {dt_model.featureImportances},\
        max depth is {dt_model.getMaxDepth()},\
        num nodes is {dt_model.numNodes},\
        depth of the model is {dt_model.depth},\
        explain the data in an elegant way.\
        Must not bold the Headings but must use\
        '.' for bullet points and give a newline\
        after every 15 words in a line."""

        # Giving API Key ro Configure model
        genai.configure(api_key="AIzaSyAfe09bOemDufX_OyYz8qkL1tAPcpdn9WU")

        # Initialize the model
        gemini = genai.GenerativeModel(model_name='gemini-1.5-pro')

        # Generate Content
        response = gemini.generate_content(prompt)
        return response.text

    # Random Forest Classifier
    def randomForestClassifier(self, df, label):
        # To Train a Random Forest Classifier Model
        from pyspark.ml.classification import RandomForestClassifier
        # To Train a Pipeline
        from pyspark.ml import Pipeline
        # To Evaluate the Random Forest Classifier Model
        from pyspark.ml.evaluation import MulticlassClassificationEvaluator
        # To Generate Statistics from the dataset in Natural Language
        import google.generativeai as genai

        rf = RandomForestClassifier(featuresCol="features", labelCol=label)

        # Create pipeline
        pipeline = Pipeline(stages=[rf])

        # Split data into training and test sets
        train_data, test_data = df.randomSplit([0.8, 0.2], seed=1234)

        # Fit the pipeline to training data
        model = pipeline.fit(train_data)

        # Extract the logistic regression stage from the pipeline model
        rf_model = model.stages[-1]
        # self.save_model(rf_model, f"random_forest_model_{dp.file_name}")

        # Make predictions on test data
        predictions = model.transform(test_data)

        # Evaluate model using accuracy
        evaluator = MulticlassClassificationEvaluator(
            labelCol=label, predictionCol="prediction", metricName="accuracy")
        accuracy = evaluator.evaluate(predictions)

        prompt = f"""Represent the following Data in an elegant\
        and comprehensive manner without redundant sentences:\
        accuracy of the Random Forest classifier Model is {accuracy},\
        feature importances is {rf_model.featureImportances},\
        max depth is {rf_model.getMaxDepth()},\
        number of trees is {rf_model.getNumTrees},\
        explain the data in an elegant way.\
        Must not bold the Headings and use bullet points\
        and give a newline after every 15 words in a line."""

        # Giving API Key ro Configure model
        genai.configure(api_key="AIzaSyAfe09bOemDufX_OyYz8qkL1tAPcpdn9WU")

        # Initialize the model
        gemini = genai.GenerativeModel(model_name='gemini-1.5-pro')

        # Generate Content
        response = gemini.generate_content(prompt)
        return response.text

    # Linear Regression Model
    def linearRegression(self, df, label):
        # To Train a Linear Regression Model
        from pyspark.ml.regression import LinearRegression
        # To Train a Pipeline
        from pyspark.ml import Pipeline
        # To Evaluate the Linear Regression Model
        from pyspark.ml.evaluation import RegressionEvaluator
        # To Generate Statistics from the dataset in Natural Language
        import google.generativeai as genai

        lr = LinearRegression(featuresCol="features", labelCol=label)

        # Split the data into training and testing sets
        train_data, test_data = df.randomSplit([0.7, 0.3], seed=42)

        # Create a pipeline with the Logistic Regression model
        pipeline = Pipeline(stages=[lr])
        # Train the model
        model = pipeline.fit(train_data)

        # Extract the logistic regression stage from the pipeline model
        lr_model = model.stages[-1]
        # self.save_model(lr_model, f"linear_regression_model_{dp.file_name}")

        # Evaluate the model
        predictions = model.transform(test_data)
        evaluator = RegressionEvaluator(
            labelCol=label, predictionCol="prediction", metricName="rmse")
        rmse = evaluator.evaluate(predictions)

        prompt = f"""Represent the following Data in an elegant\
        and comprehensive manner without redundant sentences:\
        root mean squared error of the linear Regression Model is {rmse},\
        coefficients of the model are {lr_model.coefficients},\
        intercept of the model is {lr_model.intercept},\
        R-squared is {lr_model.summary.r2},\
        explain the data using bullet points.\
        Must not bold the Headings and not the matrices\
        and give a newline after every 15 words in a line."""

        # Giving API Key ro Configure model
        genai.configure(api_key="AIzaSyAfe09bOemDufX_OyYz8qkL1tAPcpdn9WU")

        # Initialize the model
        gemini = genai.GenerativeModel(model_name='gemini-1.5-pro')

        # Generate Content
        response = gemini.generate_content(prompt)
        return response.text


if __name__ == "__main__":
    from pyspark.sql import SparkSession
    from Data_Preprocessing import DataPreprocessing
    from Knowledge_Representation import KnowledgeRepresentation


# Build the SparkSession
    spark = SparkSession.builder.master("local").appName(
        "Insight Generation").getOrCreate()

    # Set log level to ERROR (for good measure)
    spark.sparkContext.setLogLevel("ERROR")

    dp = DataPreprocessing()
    df = dp.readCsv(session=spark)
    target = input("Enter Name of the Target Column: ")

    numeric = []
    categorical = []
    for column in df.dtypes:  # Check the data type of each column
        # If the data type is string, it is categorical
        if column[1] == 'string' or column[1] == 'boolean':
            categorical.append(column[0])
        else:  # If the data type is numeric, it is numeric
            numeric.append(column[0])

    kr = KnowledgeRepresentation()

    df = dp.fillMissingValues(df, numeric, categorical)

    df_pandas = df.toPandas()

    kr.show_frequencies(df_pandas, target)
    kr.show_distribution(df_pandas, target)
    kr.show_describe_stats(df_pandas, target)

    df = dp.removeOutliers(df, numeric)

    df = dp.LabelEncoding(df, categorical)

    df = dp.NormalizeNumericColumns(df, numeric + categorical)

    insights = InsightGeneration()
    insights.KMeansClustering(df)

    # insights = InsightGeneration()
    insights.logisticRegression(df, target)

    # insights = InsightGeneration()
    insights.decisionTreeClassifier(df, target)

    # insights = InsightGeneration()
    insights.randomForestClassifier(df, target)
    # insights = InsightGeneration()
    # insights.linearRegression(df, 'median_house_value')
