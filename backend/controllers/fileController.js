import multer from "multer";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { redisClient } from "../config/redisConfig.js";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../config/s3Client.js";
import * as z from "zod";
import axios from "axios";
import { fileScanningQueue } from "../config/workerConfig.js";
import producer from "../kafka/producer.js";
import { emailQueue } from "../config/workerConfig.js";
const schema = z.object({
  password: z.string().min(2).max(16).optional(),
  daysToExpire: z.coerce.number().int().min(1).max(30).default(7),
});

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(
      null,
      `${Math.random().toString(36).substring(2, 15)}-${Date.now()}-${file.originalname}`,
    );
  },
});
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype?.startsWith("video/")) {
      return cb(new Error("Videos are not allowed"), false);
    }

    const allowedTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/bmp",
      "image/webp",
      "image/svg+xml",
      "image/x-icon",
      "image/vnd.microsoft.icon",
    ]);

    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

async function verifyCloudflareToken(token, ip) {
  console.log(token, ip);
  try {
    let verify = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: ip,
      },
    );
    return verify.data.success;
  } catch (err) {
    console.log(err);
    throw new Error("error");
  }
}

export const uploadFile = async (req, res) => {
  const requestID = crypto.randomBytes(16).toString("hex");
  //my data are coming along with file sin formData

  upload.array("files", 10)(req, res, async (err) => {
    try {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const { password, daysToExpire } = schema.parse(req.body);
      const passwordProtected = password ? true : false;
      const expiryDays = daysToExpire ?? 7;
      const expiryDate = new Date(
        Date.now() + expiryDays * 24 * 60 * 60 * 1000,
      );

      const uploadedFiles = [];
      let ip = req.ip;
      let token = req.body["cf-turnstile-response"];
      let verification = await verifyCloudflareToken(token, ip);
      if (verification) {
        for (const file of req.files) {
          console.log(file);
          //remove spaces from file name
          const fileName = file.originalname.replace(/ /g, "");
          const s3Key = `${requestID}-${fileName}`;
          console.log(s3Key);
          console.log(password);
          console.log(daysToExpire);
          const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fs.createReadStream(file.path),
            ContentType: file.mimetype,
          });
          let result = await s3.send(command);
          uploadedFiles.push({
            id: s3Key,
            name: file.originalname,
            size: file.size,
            type: file.mimetype,
            requestID: requestID,
            uploadedAt: new Date().toISOString(),
          });
          //get all emails from request body

          await producer.send(
            {
              topic: "file-scanning",
              messages: [
                {
                  value: JSON.stringify({ requestId: requestID, s3Key: s3Key }),
                },
              ],
            },
            {
              timeout: 10000,
            },
          );
          // console.log(uploadedFiles);
          fs.unlinkSync(file.path);
        }

        //storing json object in redis
        await redisClient.set(
          `request:${requestID}`,

          JSON.stringify({
            passwordProtected: passwordProtected,
            password: password,
            expiryDate,
            uploadedFiles,
          }),
          "EX",
          expiryDays * 24 * 60 * 60,
          "NX",
        );
        let emails = [];
        if (req.body.emails) {
          try {
            const parsed = JSON.parse(req.body.emails);
            if (!Array.isArray(parsed)) {
              return res.status(400).json({ error: "Invalid emails format" });
            }
            if (parsed.length > 3) {
              return res
                .status(400)
                .json({ error: "You can notify up to 3 email addresses" });
            }
            emails = parsed;
          } catch {
            return res.status(400).json({ error: "Invalid emails format" });
          }
        }
        let link = `https://www.passmyfiles.com/files/share/${requestID}`;

        if (emails.length > 0) {
          await emailQueue.add(
            "send-email",
            {
              requestID: requestID,
              emails: emails,
              link: link,
              senderEmail: req.body.email,
            },
            {
              attempts: 1,
              backoff: {
                type: "fixed",
                delay: 1000,
              },
            },
          );
        }

        return res.status(200).json({
          message: "Files uploaded successfully",

          link: link,
        });
      } else {
        return res.status(400).json({ error: "Invalid Security key" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid Parameters" });
      } else {
        console.error(err);
        res.status(500).json({ error: "Server error" });
      }
    }
  });
};

export const validateFileRequest = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("I am here");
    console.log(id);
    const requestData = await redisClient.get(`request:${id}`);
    if (!requestData) {
      return res.status(404).json({ error: "File not found" });
    }
    const { passwordProtected, password, expiryDate, uploadedFiles } =
      JSON.parse(requestData);
    if (passwordProtected) {
      return res.status(401).json({ error: "Password is required" });
    }
    if (expiryDate < new Date()) {
      return res.status(401).json({ error: "File has expired" });
    }
    console.log("validated");
    return res.status(200).json({ message: "File request validated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

export const getFile = async (req, res) => {
  try {
    const { id, userPassword } = req.body;
    console.log("I am here 2");
    console.log(id, userPassword);
    if (id.length > 32) {
      return res.status(401).json({ error: "Invalid id" });
    }
    if (!id) {
      return res.status(401).json({ error: "Invalid id" });
    }
    const requestData = await redisClient.get(`request:${id}`);

    if (!requestData) {
      return res.status(404).json({ error: "File not found" });
    }

    if (requestData.passwordProtected && !userPassword) {
      return res.status(401).json({ error: "Password is required" });
    }

    if (
      requestData.passwordProtected &&
      (userPassword.length < 2 || userPassword.length > 16)
    ) {
      return res
        .status(401)
        .json({ error: "Password must be between 2 and 16 characters" });
    }

    const { passwordProtected, password, expiryDate, uploadedFiles } =
      JSON.parse(requestData);
    if (passwordProtected && userPassword !== password) {
      return res.status(401).json({ error: "Password is invalid" });
    }
    if (expiryDate < new Date()) {
      return res.status(401).json({ error: "File has expired" });
    }

    console.log("--------------------------------");

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(404).json({ error: "Files not found" });
    }

    const expiresAt =
      typeof expiryDate === "string"
        ? expiryDate
        : expiryDate
          ? new Date(expiryDate).toISOString()
          : null;

    res.status(200).json({
      message: "Files found",
      requestID: id,
      totalFiles: uploadedFiles.length,
      expiresAt,
      files: uploadedFiles.map((file) => {
        return {
          id: file.id,
          name: file.name,
          size: file.size / (1024 * 1024) + " MB",
          type: file.type,
          uploadedAt: file.uploadedAt,
          expiresAt,
          downloads: file.downloads,
        };
      }),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const previewFile = async (req, res) => {
  try {
    const { requestId, fileId } = req.body;

    console.log(requestId, fileId);
    const requestData = await redisClient.get(`request:${requestId}`);
    if (!requestData) {
      return res.status(404).json({ error: "File not found" });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileId,
    });

    const response = await s3.send(command);
    const contentType = response.ContentType;
    res.setHeader("Content-Type", contentType);

    response.Body.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
