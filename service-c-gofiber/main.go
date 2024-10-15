package main

import (
	"context"
	"io"
	"log"
	"net"
	"os"
	"os/signal"
	"service-c-gofiber/proto_gen" // Adjust the import path as necessary
	"strings"
	"syscall"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
)

type server struct {
	proto_gen.UnimplementedExampleServer // Embed the unimplemented server
}

// Implement the unaryCall method
func (s *server) UnaryCall(ctx context.Context, req *proto_gen.ClientMessage) (*proto_gen.ServerMessage, error) {
	// Your logic here
	return &proto_gen.ServerMessage{ServerMessage: "Received: " + req.ClientMessage}, nil
}

// Implement the serverStreamingCall method
func (s *server) ServerStreamingCall(req *proto_gen.ClientMessage, stream proto_gen.Example_ServerStreamingCallServer) error {
	// Your logic here
	for i := 0; i < 5; i++ {
		if err := stream.Send(&proto_gen.ServerMessage{ServerMessage: "Streamed message " + req.ClientMessage}); err != nil {
			return err
		}
	}
	return nil
}

// Implement the clientStreamingCall method
func (s *server) ClientStreamingCall(stream proto_gen.Example_ClientStreamingCallServer) error {
	var messages []string
	for {
		req, err := stream.Recv()
		if err == io.EOF {
			// Send back the response
			return stream.SendAndClose(&proto_gen.ServerMessage{ServerMessage: "Received: " + strings.Join(messages, ", ")})
		}
		if err != nil {
			return err
		}
		messages = append(messages, req.ClientMessage)
	}
}

// Implement the bidirectionalStreamingCall method
func (s *server) BidirectionalStreamingCall(stream proto_gen.Example_BidirectionalStreamingCallServer) error {
	for {
		req, err := stream.Recv()
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return err
		}
		// Echo the received message
		if err := stream.Send(&proto_gen.ServerMessage{ServerMessage: "Echo: " + req.ClientMessage}); err != nil {
			return err
		}
	}
}

func main() {
	// Set up gRPC server
	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	proto_gen.RegisterExampleServer(s, &server{})

	// Start the gRPC server in a goroutine
	go func() {
		log.Println("gRPC server is running :)")
		if err := s.Serve(lis); err != nil {
			log.Fatalf("failed to serve: %v", err)
		}
	}()

	// Set up Fiber for HTTP server
	app := fiber.New()

	app.Get("/health-check", func(c *fiber.Ctx) error {
		return c.SendString("I'm alive!")
	})

	println("Service C is running :)")

	go func() {
		if err := app.Listen(":4002"); err != nil {
			log.Fatalf("failed to start Fiber: %v", err)
		}
	}()

	// graceful shutdown
	gracefulStop := make(chan os.Signal, 1)
	signal.Notify(gracefulStop, syscall.SIGTERM, syscall.SIGINT)
	// ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	// defer cancel()
	// if err := s.GracefulStop(); err != nil {
	// 	log.Fatalf("failed to gracefully stop: %v", err)
	// }
	<-gracefulStop
	s.GracefulStop()
	log.Println("gRPC server gracefully stopped")

	if err := app.Shutdown(); err != nil {
		log.Fatalf("failed to gracefully stop Fiber: %v", err)
	} else {
		log.Println("Fiber gracefully stopped")
	}
}
