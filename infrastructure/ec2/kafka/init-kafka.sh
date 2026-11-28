sudo docker compose exec -T kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --create --if-not-exists \
  --topic purchases \
  --partitions 1 \
  --replication-factor 1
