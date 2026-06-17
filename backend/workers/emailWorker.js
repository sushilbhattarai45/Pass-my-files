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
          body: "Someone has shared a file with you. Click the link to view the file.",
          html: `<p>Someone has shared a file with you. Click the link to view the file.</p>
          <a href="${link}">View File</a>`,
          text: "Someone has shared a file with you. Click the link to view the file.",
          campaign: "File Sharing",
        },
        {
          headers: {
            "x-api-key":
              "e0fddddc1b7f7ecd2b0a746581899da257c92608ac6d28966e7ba0f149300c18",
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
