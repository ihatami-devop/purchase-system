import json
import requests
import os

from flask_cors import CORS
from flask import Flask, jsonify, request
from kafka import KafkaProducer

app = Flask(__name__)
CORS(app, origins=[os.getenv("FRONTEND_URL")])

producer = KafkaProducer(
    bootstrap_servers=os.getenv("KAFKA_URL"),
    value_serializer=lambda value: json.dumps(value).encode("utf-8")
)

@app.route("/buy", methods=["POST"])
def buy_item():
    purchase = request.get_json()

    producer.send("purchases", purchase)
    producer.flush()

    return jsonify({"message": "Purchase event published"}), 202

@app.route("/purchases", methods=["GET"])
def get_purchases():
    response = requests.get(
        os.getenv("API_SERVER_URL"),
        timeout=5
    )

    return response.json(), response.status_code

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)