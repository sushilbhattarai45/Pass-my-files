import { redisClient } from "../config/redisConfig.js";

const rateLimiter = async (req, res, next) => {
  //full ip address
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const key = `rate_limit:${ip}`;

  let ipCount = await redisClient.get(key);
  console.log(ipCount);
  if (ipCount) {
    ipCount = parseInt(ipCount);
  } else {
    await redisClient.set(key, 0, "EX", 60); // 60 seconds
    ipCount = 0;
  }
  await redisClient.incr(key);
  if (ipCount > 20) {
    return res.status(429).json({ message: "Too many requests" });
  }
  next();
};

export default rateLimiter;
