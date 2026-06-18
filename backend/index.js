import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { connectDb } from "./db/connectDb.js";
import fileRoutes from "./routes/fileRoutes.js";
import { connectRedis } from "./config/redisConfig.js";
dotenv.config();
import { redisClient } from "./config/redisConfig.js";
const PORT = process.env.PORT || 3000;
import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./config/s3Client.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { fileExpiringQueue } from "./config/workerConfig.js";
import { clam } from "./config/clamavConfig.js";
import producer from "./kafka/producer.js";

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(rateLimiter);
app.use("/files", fileRoutes);

async function startServer() {
  try {
    await connectDb();

    await connectRedis();
    app.listen(6000, async () => {
      console.log(`Server is running on port ${PORT}`);
      const result = await s3.send(new ListBucketsCommand({}));
      startExpiringWorker();

      producer.send({
        topic: "file-scanning",
        messages: [
          { value: JSON.stringify({ requestId: "requestId", s3Key: "s3Key" }) },
        ],
      });
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
async function startExpiringWorker() {
  await fileExpiringQueue.upsertJobScheduler(
    "fileExpiringQueue",
    {
      pattern: "*/10 * * * * *", // every 10 seconds
    },
    async () => {
      await fileExpiringQueue.add("fileExpiringQueue", {
        message: "Expiring file",
      });
    },
  );
}
