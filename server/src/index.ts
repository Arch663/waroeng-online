
import dotenv from "dotenv";
import type { AddressInfo } from "node:net";
import { initializeDatabase } from "./db";
import app from "./app";

dotenv.config();

const initialPort = Number(process.env.PORT ?? 3000);
const hasExplicitPort = process.env.PORT != null;

function startServer(port: number) {
  const server = app.listen(port, () => {
    const address = server.address() as AddressInfo | null;
    const activePort = address?.port ?? port;
    console.log(`Server running on port ${activePort}`);
  });

  server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE" && !hasExplicitPort) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, retrying on ${nextPort}...`);
      startServer(nextPort);
      return;
    }
    throw error;
  });
}

initializeDatabase()
  .then(() => {
    startServer(initialPort);
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
