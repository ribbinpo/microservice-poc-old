package main

import (
	"github.com/gofiber/fiber/v2"
)

func main() {
	app := fiber.New()

	app.Get("/health-check", func(c *fiber.Ctx) error {
		return c.SendString("I'm alive!")
	})

	println("Service C is running :)")

	app.Listen(":4002")
}
