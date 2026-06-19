import Redis from "ioredis";

export const redisClient = new Redis({
  host: "file-redis",
  port: 6379,
  maxRetriesPerRequest: null,
});

export async function connectRedis() {
  try {
    const pong = await redisClient.ping();
    console.log(pong);

    if (pong === "PONG") {
      console.log("Redis Connected");
    }
  } catch (error) {
    console.error(" Redis Connection Failed");
    console.error(error);
    throw error;
  }
}
