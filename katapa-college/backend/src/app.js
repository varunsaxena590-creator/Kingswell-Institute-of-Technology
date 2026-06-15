const express = require("express");
const cors = require("cors");

const courseRoutes = require("./routes/courseRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Katapa College backend is running",
  });
});

function sendHealth(req, res) {
  res.json({
    success: true,
    status: "ok",
    backend: "up",
    database: "up",
    db: {
      status: "up",
      type: "local-memory",
    },
    time: new Date().toISOString(),
  });
}

app.get("/health", sendHealth);
app.get("/status", sendHealth);
app.get("/api/health", sendHealth);

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    frontend: "up",
    backend: "up",
    database: "up",
    services: {
      backend: {
        status: "up",
      },
      database: {
        status: "up",
        type: "local-memory",
      },
    },
    time: new Date().toISOString(),
  });
});

app.use("/api/courses", courseRoutes);
app.use("/api/contact", contactRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;
