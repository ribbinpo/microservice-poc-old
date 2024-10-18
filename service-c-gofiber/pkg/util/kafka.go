package utils

import (
	"context"
	"service-c-gofiber/config"
	"time"

	"github.com/segmentio/kafka-go"
)

func KafkaConn(cfg config.KafaConfig) *kafka.Conn {
	conn, err := kafka.DialLeader(context.Background(), "tcp", cfg.Url, cfg.Topic, 0)
	conn.SetReadDeadline(time.Now().Add(10 * time.Second))

	if err != nil {
		panic(err)
	}
	return conn
}

// check kafka topic is already exists
func IsTopicAlreadyExists(conn *kafka.Conn, topic string) bool {
	partitions, err := conn.ReadPartitions()
	if err != nil {
		panic(err)
	}

	for _, partition := range partitions {
		if partition.Topic == topic {
			return true
		}
	}
	return false
}

// produce message to kafka
func ProduceMessage(conn *kafka.Conn, msg []kafka.Message) {
	// produce message
	_, err := conn.WriteMessages(msg...)
	if err != nil {
		panic(err)
	}
}
