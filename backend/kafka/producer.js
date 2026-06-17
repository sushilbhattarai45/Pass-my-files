import { kafkaClient } from "../config/kafkaConfig.js";

const producer = kafkaClient.producer();

await producer.connect();

export default producer;
