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
      //template html  outlook compatible

      const { data } = await axios.post(
        "https://api.ehulak.tech/email/processEmail",
        {
          to: email,
          subject: "Someone has shared a file with you",
          body: "Someone has shared a file with you.",
          html: `<table width='100%' cellspacing='0' cellpadding='0' style='background:#0a0a0f;padding:20px;'><tr><td align='center'><table width='600' cellspacing='0' cellpadding='0' style='background:#111827;border:1px solid rgba(255,255,255,0.1);padding:24px;font-family:Arial,sans-serif;color:#ffffff;'><tr><td style='font-size:20px;font-weight:bold;padding-bottom:12px;'>📁 File Shared With You</td></tr><tr><td style='font-size:14px;color:#cbd5e1;line-height:1.6;padding-bottom:20px;'>Someone has shared a file with you using <b>PassMyFiles</b>. Click below to view and download the file.</td></tr><tr><td align='center' style='padding:20px 0;'><a href='${link}' style='background:#3B82F6;color:#ffffff;padding:12px 20px;text-decoration:none;font-weight:bold;display:inline-block;'>Open File</a></td></tr><tr><td style='font-size:12px;color:#94a3b8;word-break:break-all;padding-top:10px;'>If the button doesn’t work, copy this link:<br/><a href='${link}' style='color:#3B82F6;'>${link}</a></td></tr><tr><td style='border-top:1px solid rgba(255,255,255,0.1);padding-top:15px;font-size:11px;color:#6b7280;'>This email was sent via PassMyFiles secure file sharing system.</td></tr></table></td></tr></table>`,
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
