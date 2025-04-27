import { Request, Response, NextFunction } from "express";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import express from "express";
import {
  updateCharacterAchievementPoints,
  updateCharacterEquippedItemLevel,
} from "../services/characterService";
import { Character } from "../models/Character";
import { IncomingMessage, ClientRequest } from "http";

dotenv.config();

export interface ProxyOptions {
  target: string;
  changeOrigin: boolean;
  secure: boolean;
  requiresAuth?: boolean;
  pathRewrite?: {
    [key: string]: string;
  };
  onProxyRes?: (proxyRes: IncomingMessage, req: Request, res: Response) => void;
  onProxyReq?: (proxyReq: ClientRequest, req: Request, res: Response) => void;
}

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const clientId = process.env.BLIZZARD_CLIENT_ID;
  const clientSecret = process.env.BLIZZARD_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Blizzard API credentials not configured");
  }

  const response = await fetch("https://oauth.battle.net/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${clientId}:${clientSecret}`
      ).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Failed to get access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
  return accessToken;
}

export function createProxyMiddleware(
  options: ProxyOptions
): express.RequestHandler {
  const {
    target,
    changeOrigin = true,
    secure = true,
    pathRewrite,
    requiresAuth = false,
    onProxyRes,
    onProxyReq,
  } = options;
  const protocol = target.startsWith("https") ? https : http;

  return (req: Request, res: Response, next: NextFunction) => {
    const handleRequest = async () => {
      try {
        // Log incoming request
        console.log(`[Proxy] Incoming request: ${req.method} ${req.url}`);
        console.log(`[Proxy] Headers:`, req.headers);
        if (req.body) {
          console.log(`[Proxy] Request body:`, req.body);
        }

        // Apply path rewriting if specified
        let path = req.url;
        if (pathRewrite) {
          Object.entries(pathRewrite).forEach(([pattern, replacement]) => {
            path = path.replace(new RegExp(pattern), replacement);
          });
        }

        const targetUrl = new URL(path, target);
        console.log(`[Proxy] Proxying to: ${targetUrl.toString()}`);

        if (changeOrigin) {
          req.headers.host = targetUrl.host;
        }

        // Add authorization header if required
        if (requiresAuth) {
          try {
            const token = await getAccessToken();
            req.headers.authorization = `Bearer ${token}`;
          } catch (error) {
            console.error("[Proxy] Failed to get access token:", error);
            return res
              .status(500)
              .json({ error: "Failed to authenticate with Blizzard API" });
          }
        }

        // Determine the appropriate namespace based on the API endpoint
        const namespaceMap = {
          "/data/wow/item": "static-us",
          "/data/wow/item-appearance": "static-us",
          "/data/wow/achievement": "static-classic-us",
          "/data/wow/media": "static-classic-us",
        };

        let namespace = "profile-classic-us";
        for (const [prefix, value] of Object.entries(namespaceMap)) {
          if (path.startsWith(prefix)) {
            namespace = value;
            break;
          }
        }

        const proxyReq = protocol.request(targetUrl, {
          method: req.method,
          headers: {
            ...req.headers,
            "accept-encoding": "identity", // Request uncompressed responses
            accept: "application/json", // Explicitly request JSON
            "Battlenet-Namespace": namespace, // Use appropriate namespace
          },
          rejectUnauthorized: secure,
        });

        proxyReq.on("error", (err) => {
          console.error("[Proxy] Request error:", err);
          res.status(500).json({ error: "Proxy request failed" });
        });

        proxyReq.on("response", (proxyRes) => {
          console.log(`[Proxy] Received response: ${proxyRes.statusCode}`);
          console.log(
            `[Proxy] Content-Type:`,
            proxyRes.headers["content-type"]
          );
          console.log(`[Proxy] Response headers:`, proxyRes.headers);

          // Set the status code
          res.status(proxyRes.statusCode || 500);

          // Remove problematic headers that will be set automatically
          delete proxyRes.headers["content-length"];
          delete proxyRes.headers["transfer-encoding"];

          // Copy remaining headers
          Object.entries(proxyRes.headers).forEach(([key, value]) => {
            if (value) {
              res.setHeader(key, value);
            }
          });

          // Ensure Content-Type is set for JSON responses
          if (!res.getHeader("Content-Type")) {
            res.setHeader("Content-Type", "application/json");
          }

          // Collect response data for async processing
          let responseData = "";
          proxyRes.on("data", (chunk) => {
            responseData += chunk;
          });

          // Handle the response end
          proxyRes.on("end", async () => {
            try {
              // Parse the response data
              const parsedData = JSON.parse(responseData);

              // If this is a character profile request and it was successful, update our database
              if (
                proxyRes.statusCode === 200 &&
                req.url?.includes("/profile/wow/character/")
              ) {
                // Extract realm and name from the URL
                const urlParts = req.url.split("/");
                const realm = urlParts[urlParts.length - 2];
                const name = urlParts[urlParts.length - 1];

                // Check if character is in Low Calibre
                const isInLowCalibre =
                  parsedData.guild?.name?.toLowerCase() === "low calibre";

                // Update character data
                if (isInLowCalibre) {
                  // Update achievement points if available
                  if (parsedData.achievement_points) {
                    updateCharacterAchievementPoints(
                      name,
                      realm,
                      parsedData.achievement_points
                    ).catch((error) => {
                      console.error(
                        "[Proxy] Failed to update character achievement points:",
                        error
                      );
                    });
                  }

                  // Update equipped item level if available
                  if (parsedData.equipped_item_level) {
                    updateCharacterEquippedItemLevel(
                      name,
                      realm,
                      parsedData.equipped_item_level
                    ).catch((error) => {
                      console.error(
                        "[Proxy] Failed to update character equipped item level:",
                        error
                      );
                    });
                  }
                }

                // Update removed status
                await Character.findOneAndUpdate(
                  { name, realm },
                  { removed: !isInLowCalibre },
                  { upsert: true }
                ).catch((error: Error) => {
                  console.error(
                    "[Proxy] Failed to update character removed status:",
                    error
                  );
                });
              }

              // Call onProxyRes callback if provided
              if (onProxyRes) {
                onProxyRes(proxyRes, req, res);
              }
            } catch (error) {
              console.error(
                "[Proxy] Failed to parse response for database update:",
                error
              );
            }
          });

          // Pipe the response to the client
          proxyRes.pipe(res);
        });

        if (req.body) {
          proxyReq.write(JSON.stringify(req.body));
        }
        proxyReq.end();
        return;
      } catch (err) {
        console.error("[Proxy] Middleware error:", err);
        res.status(500).json({ error: "Proxy middleware failed" });
      }
    };

    handleRequest().catch(next);
  };
}
