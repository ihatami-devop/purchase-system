import json
import requests

from kafka import KafkaConsumer

consumer = KafkaConsumer(
    "purchases",
    bootstrap_servers="localhost:9092",
    group_id="purchase-consumer-group",
    auto_offset_reset="earliest",
    enable_auto_commit=False, # Used this so Kafka does not commit unsuccessful purchases
    value_deserializer=lambda message: json.loads(message.decode("utf-8"))
)


def consume_messages():
    print("Waiting for purchase events...")

    for message in consumer:
        purchase = message.value

        try:
            # Trying to insert the purchase into the DB through the api-server
            response = requests.post(
                "http://localhost:5000/purchases",
                json=purchase,
                timeout=20
            )

            # Raises an exception if api-server returns an HTTP error
            response.raise_for_status()
            # Commits the message only after api-server processes the purchase
            consumer.commit()
            print(f"Purchase forwarded to API: {purchase}")

        except requests.RequestException as error:
            print(f"Failed to forward purchase: {error}")
            break

        print(f"Purchase saved: {purchase}")


if __name__ == "__main__":
    consume_messages()