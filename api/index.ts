import app from "../server/src/app";
import { initializeDatabase } from "../server/src/db";

let isInitialized = false;

export default async (req: any, res: any) => {
  try {
    if (!isInitialized) {
      console.log("Connecting to database...");
      await initializeDatabase();
      isInitialized = true;
    }
    return app(req, res);
  } catch (error: any) {
    console.error("Vercel Function Error:", error);
    res.status(500).json({
      error: "Service Initialization Error",
      details: error.message,
    });
  }
};
