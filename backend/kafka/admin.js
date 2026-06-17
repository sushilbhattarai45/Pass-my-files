import { kafkaClient } from "../config/kafkaConfig.js";

export const admin = kafkaClient.admin();

async function setupTopics() {
  await admin.connect();

  console.log("Creating topics...");
  await admin.createTopics({
    topics: [
      {
        topic: "email",
        replicationFactor: 1,
        partitions: 6,
      },
      {
        topic: "file-scanning",
        replicationFactor: 1,
        partitions: 6,
      },
    ],
  });

  console.log("Listing topics...");
  const topics = await admin.listTopics();
  console.log("Topics:", topics);

  await admin.disconnect();
}

setupTopics().catch((error) => {
  console.error("Failed to setup Kafka topics:", error.message);
  process.exit(1);
});

export default admin;
