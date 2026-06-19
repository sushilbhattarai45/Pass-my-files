import { kafkaClient } from "../../config/kafkaConfig.js";
import { fileScanningQueue } from "../../config/workerConfig.js";
const consumer = kafkaClient.consumer({
  groupId: "scan-consumer",
});

await consumer.subscribe({
  topic: "file-scanning",
  fromBeginning: true,
});

await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    const value = JSON.parse(message.value);

    try {
      await fileScanningQueue.add(
        "scan-file",
        {
          requestID: value.requestId,
          s3Key: value.s3Key,
        },
        {
          attempts: 5,
          backoff: {
            type: "fixed",
            delay: 1000,
          },
        },
      );
    } catch (error) {
      console.log(error);
      throw new Error("Failed to scan file.");
    }
  },
});

export default consumer;
