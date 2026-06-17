import { Queue } from "bullmq";
import { redisClient } from "./redisConfig.js";

export const fileExpiringQueue = new Queue("fileExpiringQueue", {
  connection: redisClient,
});

export const fileScanningQueue = new Queue("fileScanningQueue", {
  connection: redisClient,
});

export const emailQueue = new Queue("emailQueue", {
  connection: redisClient,
});
