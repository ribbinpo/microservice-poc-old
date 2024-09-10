import { Kafka, Consumer } from "kafkajs";

export class KafkaConsumer {
  private consumer: Consumer;

  constructor(clientId: string, groupId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });
    this.consumer = kafka.consumer({ groupId });
  }

  async initialize(): Promise<void> {
    await this.consumer.connect();
    console.log("Consumer connected");
  }

  async subscribeToTopic(topic: string): Promise<void> {
    await this.consumer.subscribe({ topic, fromBeginning: true });
    console.log(`Subscribed to topic: ${topic}`);
  }

  async startConsuming(messageHandler: (message: string) => void): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          topic,
          partition,
          offset: message.offset,
          value: message.value?.toString(),
        });
        if (message.value) {
          messageHandler(message.value.toString());
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
    console.log("Consumer disconnected");
  }
}
