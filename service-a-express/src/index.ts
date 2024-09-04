import express from "express";

const app = express();

app.get("health-check", (req, res) => {
  res.send("Server is running :)");
});

app.listen(4001, () => {
  console.log("Server is running on port 4001");
});
