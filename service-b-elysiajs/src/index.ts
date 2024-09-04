import { Elysia } from "elysia";

const app = new Elysia().get("/health-check", () => "Server B is running :)").listen(4001);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
