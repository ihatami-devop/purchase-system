import json
import requests

from flask_cors import CORS
from flask import Flask, jsonify, request
from kafka import KafkaProducer

app = Flask(__name__)
CORS(app, origins=["http://localhost:8000"])

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
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
        "http://localhost:5000/purchases",
        timeout=5
    )

    return response.json(), response.status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)