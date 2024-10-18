package main

import (
	"context"
	"log"
	"service-c-gofiber/config"
	utils "service-c-gofiber/pkg/util"

	"github.com/gofiber/fiber/v2"
	"github.com/segmentio/kafka-go"
)

func main() {
	// connect to kafka
	cfg := config.KafaConfig{
		Url:   "localhost:9092",
		Topic: "test-topic",
	}
	conn := utils.KafkaConn(cfg)
	app := fiber.New()

	app.Get("/health-check", func(c *fiber.Ctx) error {
		return c.SendString("I'm alive!")
	})

	app.Post("/produce", func(c *fiber.Ctx) error {
		msg := c.Body()
		data := []kafka.Message{
			{
				Value: []byte(msg),
			},
		}
		utils.ProduceMessage(conn, data)
		return c.SendString("Message sent to Kafka")
	})

	r := kafka.NewReader(kafka.ReaderConfig{
		Brokers:   []string{cfg.Url},
		Topic:     cfg.Topic,
		GroupID:   "service-c-group",
		Partition: 0,
		MaxBytes:  10e6, // 10MB
	})
	r.SetOffset(0)
	for {
		m, err := r.ReadMessage(context.Background())
		if err != nil {
			log.Fatal(err)
			break
		}
		log.Printf("message at offset %d: %s = %s\n", m.Offset, string(m.Key), string(m.Value))
	}

	if err := r.Close(); err != nil {
		log.Fatalf("failed to close reader: %v", err)
	}

	if err := app.Listen(":4003"); err != nil {
		log.Fatalf("failed to start Fiber: %v", err)
	}
}
