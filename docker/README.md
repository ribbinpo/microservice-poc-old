# Basic Kafka Commands

## Kafka Action

To perform a Kafka action, use the following command:

```bash
docker compose up -d
```

Create Topic

```bash
# Enter the Kafka container
docker exec -it kafka1 /bin/sh

# Go to Kafka binaries (Bitnami places them in /opt/bitnami/kafka/bin)
cd /opt/bitnami/kafka/bin

# Create a topic (no --zookeeper needed!)
kafka-topics.sh --create \
  --bootstrap-server kafka1:9092 \
  --replication-factor 1 \
  --partitions 1 \
  --topic hello_kafka
```

List All Topics

```bash
kafka-topics.sh --list --bootstrap-server kafka1:9092
```

Topic Details

```bash
kafka-topics.sh --describe --bootstrap-server kafka1:9092 --topic hello_kafka
```

Create Producer

```bash
kafka-console-producer.sh --bootstrap-server kafka1:9092 --topic hello_kafka
# then type messages...
```

Listening Consumer

```bash
kafka-console-consumer.sh --bootstrap-server kafka1:9092 --topic hello_kafka --from-beginning
```
