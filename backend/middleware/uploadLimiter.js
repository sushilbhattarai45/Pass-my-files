import { redisClient } from "../config/redisConfig.js";

const uploadLimiter = async (req, res, next) => {
  console.log("_--------------------------------");
  console.log("_--------------------------------");

  console.log("_--------------------------------");

  console.log(req.ip);
  let key = `uploadIpCount:${req.ip}`;
  let getUploadCountByIP = await redisClient.get(key);
  if (getUploadCountByIP == 0) {
    await redisClient.set(key, 0, "EX", 1 * 60 * 60); // 1 hour
  }

  console.log(getUploadCountByIP);
  if (getUploadCountByIP > 10) {
    return res.status(401).send({
      message: "Too many uploads. Wait for 1 hour to upload more.",
    });
  }
  await redisClient.incr(key);
  next();
};

export default uploadLimiter;
