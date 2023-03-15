const express = require("express");
// const morgan = require("morgan");
const cors = require("cors");
const dotenv = require("dotenv");
const api = require("./api");

// Initliaze app
const app = express();
app.use(express.json());
// app.use(morgan("dev"));
app.use(cors());
app.use(express.static("public"));

// Initialize env file
dotenv.config();

app.get("/", (req, res) => res.send("Hello to movie-app-tmdb API."));

const PORT = process.env.PORT || 5000;

// Listen to routes
app.use("/api", api);

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}...`);
});
