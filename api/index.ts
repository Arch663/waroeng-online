import app from "../server/src/app";
import { initializeDatabase } from "../server/src/db";

let isInitialized = false;

export default async (req: any, res: any) => {
  if (!isInitialized) {
    try {
      await initializeDatabase();
      isInitialized = true;
    } catch (error) {
      console.error("Database initialization failed:", error);
      // We still pass the request to app, but it might fail later if DB is needed
    }
  }
  return app(req, res);
};
