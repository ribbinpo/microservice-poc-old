package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"service-c-gofiber/proto_gen" // Adjust the import path as necessary

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

func unaryCall(client proto_gen.ExampleClient) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()

	req := &proto_gen.ClientMessage{ClientMessage: "Hello from Unary Call!"}
	res, err := client.UnaryCall(ctx, req)
	if err != nil {
		log.Fatalf("could not call UnaryCall: %v", err)
	}
	fmt.Printf("Unary Call Response: %s\n", res.ServerMessage)
}

func serverStreamingCall(client proto_gen.ExampleClient) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	req := &proto_gen.ClientMessage{ClientMessage: "Hello from Server Streaming Call!"}
	stream, err := client.ServerStreamingCall(ctx, req)
	if err != nil {
		log.Fatalf("could not call ServerStreamingCall: %v", err)
	}

	fmt.Println("Server Streaming Call Responses:")
	for {
		res, err := stream.Recv()
		if err != nil {
			break
		}
		fmt.Printf("Received: %s\n", res.ServerMessage)
	}
}

func clientStreamingCall(client proto_gen.ExampleClient) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	stream, err := client.ClientStreamingCall(ctx)
	if err != nil {
		log.Fatalf("could not call ClientStreamingCall: %v", err)
	}

	messages := []string{"Message 1", "Message 2", "Message 3"}
	for _, msg := range messages {
		req := &proto_gen.ClientMessage{ClientMessage: msg}
		if err := stream.Send(req); err != nil {
			log.Fatalf("could not send message: %v", err)
		}
	}
	res, err := stream.CloseAndRecv()
	if err != nil {
		log.Fatalf("could not receive response: %v", err)
	}
	fmt.Printf("Client Streaming Call Response: %s\n", res.ServerMessage)
}

func bidirectionalStreamingCall(client proto_gen.ExampleClient) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	stream, err := client.BidirectionalStreamingCall(ctx)
	if err != nil {
		log.Fatalf("could not call BidirectionalStreamingCall: %v", err)
	}

	// Send messages
	messages := []string{"Hello", "How are you?", "Goodbye"}
	for _, msg := range messages {
		req := &proto_gen.ClientMessage{ClientMessage: msg}
		if err := stream.Send(req); err != nil {
			log.Fatalf("could not send message: %v", err)
		}
	}

	// Receive responses
	go func() {
		for {
			res, err := stream.Recv()
			if err != nil {
				break
			}
			fmt.Printf("Bidirectional Streaming Response: %s\n", res.ServerMessage)
		}
	}()

	// Wait for a while before closing the stream
	time.Sleep(time.Second * 5)
	if err := stream.CloseSend(); err != nil {
		log.Fatalf("could not close stream: %v", err)
	}
}

func main() {
	// Set up a connection to the server.
	conn, err := grpc.NewClient("localhost:50051", grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Fatalf("did not connect: %v", err)
	}
	defer conn.Close()

	client := proto_gen.NewExampleClient(conn)

	// Unary Call
	unaryCall(client)

	// Server Streaming Call
	serverStreamingCall(client)

	// Client Streaming Call
	clientStreamingCall(client)

	// Bidirectional Streaming Call
	bidirectionalStreamingCall(client)
}
