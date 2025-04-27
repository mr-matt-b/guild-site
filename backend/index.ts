import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "./src/middleware/proxy";
import guildRouter from "./src/routes/guild";
import { connectDB } from "./src/config/mongodb";
import { IncomingMessage } from "http";
import { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3001;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'",
          "https://wow.zamimg.com",
          "https://render.worldofwarcraft.com",
          "data:",
          "blob:",
        ],
        scriptSrc: [
          "'self'",
          "https://wow.zamimg.com",
          "'unsafe-inline'",
          "'unsafe-eval'",
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "https://wow.zamimg.com",
          "https://render.worldofwarcraft.com",
          "https://us.api.blizzard.com",
        ],
        mediaSrc: [
          "'self'",
          "https://wow.zamimg.com",
          "https://render.worldofwarcraft.com",
        ],
      },
    },
  })
);

// Rate limiter configuration for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter configuration for proxy routes
const proxyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many proxy requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// Connect to MongoDB
connectDB().catch((error) => {
  console.error("Failed to connect to MongoDB:", error);
  process.exit(1);
});

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Apply proxy rate limiting
app.use((req, res, next) => {
  if (req.path.startsWith("/api/zamimg") || req.path.startsWith("/api/wow")) {
    proxyLimiter(req, res, next);
  } else {
    next();
  }
});

// Proxy middleware for Zamimg API
app.use(
  "/api/zamimg",
  createProxyMiddleware({
    target: "https://wow.zamimg.com",
    changeOrigin: true,
    secure: true,
    onProxyRes: (proxyRes: IncomingMessage, req: Request, res: Response) => {
      // Add CORS headers for the viewer.min.js file
      if (req.url?.includes("viewer.min.js")) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET");
      }
    },
  })
);

// Proxy middleware for WoW API
app.use(
  "/api/wow",
  createProxyMiddleware({
    target: "https://us.api.blizzard.com",
    changeOrigin: true,
    secure: true,
    requiresAuth: true,
    pathRewrite: {
      "^/api/wow": "", // remove the /api/wow prefix
    },
  })
);

// Apply API rate limiting to non-proxy routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api/zamimg") || req.path.startsWith("/api/wow")) {
    next();
  } else {
    apiLimiter(req, res, next);
  }
});

// Mount guild routes
app.use("/api/guild", guildRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      error: "Something went wrong!",
      message: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
