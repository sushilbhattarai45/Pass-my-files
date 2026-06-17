import express from "express";
import multer from "multer";
import {
  uploadFile,
  getFile,
  previewFile,
  validateFileRequest,
} from "../controllers/fileController.js";
import uploadLimiter from "../middleware/uploadLimiter.js";
const fileRouter = express.Router();

fileRouter.post("/upload", uploadFile);
fileRouter.post("/share", getFile);
fileRouter.post("/preview", previewFile);
fileRouter.get("/validate/:id", validateFileRequest);
export default fileRouter;
