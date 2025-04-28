import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "./src/middleware/proxy";
import guildRouter from "./src/routes/guild";
import { connectDB } from "./src/config/mongodb";

const app = express();
const port = process.env.PORT || 3001;

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
    origin: (origin, callback) => {
      // Allow all origins for Zamimg endpoints
      if (origin && origin.includes("zamimg")) {
        return callback(null, true);
      }

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env.FRONTEND_URL,
        "http://localhost:3000",
      ];

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Proxy middleware for Zamimg API
app.use(
  "/api/zamimg",
  createProxyMiddleware({
    target: "https://wow.zamimg.com",
    changeOrigin: true,
    secure: true,
    pathRewrite: {
      "^/api/zamimg": "", // remove the /api/zamimg prefix
    },
    onProxyRes: (proxyRes, req, res) => {
      // Ensure CORS headers are set
      res.setHeader(
        "Access-Control-Allow-Origin",
        process.env.FRONTEND_URL || "http://localhost:3000"
      );
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
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
