import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig.js";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

import { s3 } from "../config/s3Client.js";

new Worker(
  "fileExpiringQueue",
  async (job) => {
    try {
      console.log("Expiring file");
      const idsToDelete = [];
      const allRequests = await redisClient.keys("request:*");
      for (const element of allRequests) {
        let data = await redisClient.get(element);
        let expiryDate = JSON.parse(data).expiryDate;
        let timeLeft =
          (Date.parse(expiryDate) - Date.now()) / (1000 * 60 * 60 * 24);
        console.log(timeLeft);
        if (timeLeft < 1) {
          console.log(element);
          await redisClient.del(element);
          idsToDelete.push(
            JSON.parse(data).uploadedFiles.map((file) => file.id),
          );
        }
      }
      if (idsToDelete.length > 0) {
        console.log(idsToDelete);
        await s3.send(
          new DeleteObjectsCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: {
              Objects: idsToDelete.flat().map((file) => ({
                Key: file,
              })),
            },
          }),
        );
      }
    } catch (error) {
      console.error("Error expiring file:", error);
    }
  },
  {
    connection: redisClient,
  },
);
