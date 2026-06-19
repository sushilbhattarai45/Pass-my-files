import { Kafka } from "kafkajs";

import dotenv from "dotenv";

export const kafkaClient = new Kafka({
  clientId: "my-app",
  brokers: ["file-kafka:9093"],
});
