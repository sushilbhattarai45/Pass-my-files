import Redis from "ioredis";

export const redisClient = new Redis({
  host: "localhost",
  port: 6380,
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
