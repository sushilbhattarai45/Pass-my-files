import { Worker } from "bullmq";
import { redisClient } from "../config/redisConfig.js";
import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

new Worker(
  "emailQueue",
  async (job) => {
    try {
      const { emails, link, requestID } = job.data;
      console.log(emails, link, requestID);
      const emailsArray = Array.isArray(emails) ? emails : JSON.parse(emails);
      console.log(emailsArray);
      for (const email of emailsArray) {
        sendEmail(email, link, requestID);
      }
    } catch (error) {
      console.log(error);
      throw new Error("Failed to send email");
    }
  },
  {
    connection: redisClient,
  },
);

async function sendEmail(email, link, requestID) {
  try {
    console.log("Sending email");
    console.log(email, link, requestID);
    //ceck if the user has been already send for this request
    const user = await redisClient.get(`user:${requestID}:${email}`);
    if (user) {
      console.log("User has been already send for this request");
    } else {
      const { data } = await axios.post(
        "https://api.ehulak.tech/email/processEmail",
        {
          to: email,
          subject: "Someone has shared a file with you",
          body: "Someone has shared a file with you.",
          html: `
          <div style="
            font-family: Arial, sans-serif;
            background-color: #0a0a0f;
            padding: 24px;
            border-radius: 12px;
            color: #ffffff;
            max-width: 600px;
            margin: auto;
            border: 1px solid rgba(255,255,255,0.1);
          ">
            <h2 style="
              margin: 0 0 12px 0;
              font-size: 20px;
              color: #ffffff;
            ">
              📁 File Shared With You
            </h2>
        
            <p style="
              font-size: 14px;
              color: rgba(255,255,255,0.75);
              line-height: 1.6;
            ">
              Someone has shared a file with you using <b>PassMyFiles</b>.
              Click the button below to view and download the file.
            </p>
        
            <div style="margin: 24px 0;">
              <a href="${link}" target="_blank" style="
                display: inline-block;
                padding: 12px 18px;
                background: linear-gradient(90deg, #3B82F6, #8B5CF6);
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: bold;
              ">
                Open File
              </a>
            </div>
        
            <div style="
              font-size: 12px;
              color: rgba(255,255,255,0.5);
              word-break: break-all;
              margin-top: 10px;
            ">
              If the button doesn’t work, copy and paste this link:<br />
              <a href="${link}" style="color:#3B82F6;">${link}</a>
            </div>
        
            <hr style="
              border: none;
              border-top: 1px solid rgba(255,255,255,0.1);
              margin: 20px 0;
            "/>
        
            <p style="
              font-size: 11px;
              color: rgba(255,255,255,0.4);
            ">
              This email was sent via PassMyFiles secure file sharing system.
            </p>
          </div>
        `,
          // text: "Someone has shared a file with you. Click the link to view the file.",
          campaign: "File Sharing",
        },
        {
          headers: {
            "x-api-key": process.env.EMAIL_API_KEY,
            "Content-Type": "application/json",
          },
        },
      );
      console.log(data);
    }

    return true;

    //send email
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send email");
  }
}
