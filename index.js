const express = require("express");
const cors = require("cors");
require("dotenv").config;
const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Running test
app.get("/", (req, res) => {
  res.send("Frame Maker Server is running");
});
app.listen(port, () => {
  console.log("The Port Is", port);
});
