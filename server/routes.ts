import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express) {
  // Since this is a client-only app using IndexedDB,
  // we don't need any API routes
  const httpServer = createServer(app);
  return httpServer;
}
