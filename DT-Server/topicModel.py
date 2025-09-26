from transformers import pipeline

pipeline_classification_topics = pipeline("text-classification", model="chkla/parlbert-topic-german", return_all_scores=False)
text = "Barock war ein Zeitalter der Kunst und Kultur wie es sie selten gab"
print(pipeline_classification_topics(text)) # Macroeconomics