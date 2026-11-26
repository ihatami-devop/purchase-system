import os

from flask import Flask, jsonify, request
from flask_cors import CORS

from database import purchases_collection

app = Flask(__name__)
CORS(app, origins=[os.getenv("FRONTEND_URL")])

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200


@app.route("/purchases", methods=["GET"])
def get_purchases():
    purchases = list(purchases_collection.find({}, {"_id": 0}))
    return jsonify(purchases), 200

@app.route("/purchases", methods=["POST"])
def create_purchase():
    purchase = request.get_json()

    result = purchases_collection.insert_one(purchase)

    return jsonify({
        "message": "Purchase created",
        "purchase_id": str(result.inserted_id)
    }), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)