import { Kafka, Producer } from "kafkajs";

export class KafkaProducer {
  private producer: Producer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });
    this.producer = kafka.producer();
  }

  async initialize(): Promise<void> {
    await this.producer.connect();
    console.log("Producer connected");
  }

  async sendMessage(topic: string, message: string): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [{ value: message }],
      });
      console.log(`Message sent to topic ${topic}: ${message}`);
    } catch (error) {
      console.error("Error producing message:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
    console.log("Producer disconnected");
  }
}
