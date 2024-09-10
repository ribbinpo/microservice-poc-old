# Tutorial Commands

## Kafka Action

To perform a Kafka action, use the following command:

```bash
docker compose up -d
```

To create a topic, use the following command:

```bash
docker exec -it kafka kafka-topics.sh --create --topic my-topic --bootstrap-server kafka:9092
```

To list all topics, use the following command:

```bash
docker exec -it kafka kafka-topics.sh --list --bootstrap-server kafka:9092
```

To produce messages to a topic, use the following command:

```bash
docker exec -it kafka kafka-console-producer.sh --topic my-topic --bootstrap-server kafka:9092
```

To consume messages from a topic, use the following command:

```bash
docker exec -it kafka kafka-console-consumer.sh --topic my-topic --from-beginning --bootstrap-server kafka:9092
```

To check the status of the Kafka cluster, use the following command:

```bash
docker exec -it kafka kafka-topics.sh --describe --topic my-topic --bootstrap-server kafka:9092
```
