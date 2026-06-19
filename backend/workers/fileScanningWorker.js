import { Worker } from "bullmq";
import IORedis from "ioredis";

import {
  Bucket$,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { streamScan } from "../config/clamavConfig.js";
import { s3 } from "../config/s3Client.js";
dotenv.config();

const bullRedis = new IORedis({
  host: "file-redis",
  port: 6379,
  maxRetriesPerRequest: null,
});
new Worker(
  "fileScanningQueue",
  async (job) => {
    console.log("File Scanning Worker");
    console.log(job.data);
    //retry count

    console.log(job.attemptsMade);
    if (job.attemptsMade > 4) {
      console.log("Max retries reached");
      return;
    }
    await scanFile(job.data.requestId, job.data.s3Key);
  },

  {
    connection: bullRedis,
  },
);

async function scanFile(requestId, s3Key) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });
    const response = await s3.send(command);
    const stream = response.Body;

    const result = await streamScan(stream);

    console.log(result);

    if (result.isInfected) {
      await DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
      });

      //mail to user config yet to done
    }
  } catch (error) {
    console.log(error);
    throw new Error("Failed to scan file");
  }
}
