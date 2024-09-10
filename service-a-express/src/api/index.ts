import express from "express";
import { KafkaConsumer } from "./kafka/consumer";
import { KafkaProducer } from "./kafka/producer";

const app = express();
app.use(express.json());

const kafkaClientId = "service-a";
const kafkaBrokers = ["localhost:9092"]; // Replace with your Kafka broker addresses
const kafkaGroupId = "service-a-group";

const producer = new KafkaProducer(kafkaClientId + "-producer", kafkaBrokers);
const consumer = new KafkaConsumer(
  kafkaClientId + "-consumer",
  kafkaGroupId,
  kafkaBrokers
);

app.get("/health-check", (req, res) => {
  res.send("Server A is running :)");
});

// Initialize Kafka consumer
consumer
  .initialize()
  .then(() => consumer.subscribeToTopic("test-topic"))
  .then(() =>
    consumer.startConsuming((message) => {
      console.log("Received message:", message);
      // Handle the received message here
    })
  )
  .catch((error) => console.error("Error setting up consumer:", error));

// Initialize Kafka producer
producer
  .initialize()
  .catch((error) => console.error("Error setting up producer:", error));

// Add a new route for producing data
app.post("/produce", async (req, res) => {
  const { topic, message } = req.body;
  if (!topic || !message) {
    return res.status(400).json({ error: "Topic and message are required" });
  }

  try {
    await producer.sendMessage(topic, message);
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.listen(4001, () => {
  console.log("Server is running on port 4001");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  try {
    await consumer.disconnect();
    await producer.disconnect();
    console.log("Disconnected from Kafka");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

export default app;
