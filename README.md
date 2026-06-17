# PassMyFiles.com

## Overview

PassMyFiles.com is a fast and scalable file sharing platform that allows users to instantly upload and share files using a unique tracking number or shareable link. It also supports email notifications to send files or download links directly to recipients.

The system is designed with a focus on speed, reliability, and security, including virus scanning for all uploaded files before they are made available for download.

---

## Core Features

- Instant file upload and sharing
- Unique tracking number for every file
- Shareable download links
- Email notifications for recipients
- File access tracking and event logging
- Malware scanning for uploaded files
- Scalable background processing system

---

## How It Works

1. A user uploads a file through the frontend.
2. The file is stored securely in AWS S3.
3. An event is published to Kafka and/or a job is pushed to BullMQ.
4. Worker services process the file asynchronously.
5. The worker streams the file and scans it using ClamAV.
6. If the file is clean, it is marked available for sharing.
7. If infected, it is deleted from S3.
8. The system generates:
   - A unique tracking number
   - A shareable download link
9. Users can optionally send the file or link via email.

---

## Architecture

```text
Client
  ↓
Nginx (Reverse Proxy)
  ↓
Node.js Backend API
  ↓
AWS S3 (File Storage)
  ↓
  ↓
Redis (Queue Backend)
  ↓
Kafka (Event Streaming)
  ↓
BullMQ (Job Queue)
  ↓
Worker Services
   ├── ClamAV Scanner
   ├── Email Service
   └── Tracking Logger
  ↓
MongoDB (Metadata & Tracking Data)
  ↓
Redis (Queue Backend)
```
