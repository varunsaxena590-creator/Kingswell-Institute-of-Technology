require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5001;
const FALLBACK_PORT = 5000;

function startServer(port) {
  app
    .listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
    })
    .on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.log(`Port ${port} is already in use, skipping it.`);
        return;
      }

      throw error;
    });
}

startServer(PORT);

if (Number(PORT) !== FALLBACK_PORT) {
  startServer(FALLBACK_PORT);
}
