# DropLinq

DropLinq is a TypeScript and Express API for uploading files to Amazon S3 and
sharing them through download links. PostgreSQL stores user and file metadata,
Prisma provides database access, and JWT bearer tokens protect upload and file
metadata routes.

## Features

- Create an account or sign in and receive a JWT
- Upload files to Amazon S3 using multipart form data
- Stream stored files from S3 for download
- Retrieve metadata for an uploaded file
- Per-route rate limiting for user and file requests
- PostgreSQL persistence through Prisma

## Architecture

![DropLinq S3 architecture](assets/image.png)

## Tech stack

- Node.js, TypeScript, Express
- PostgreSQL and Prisma
- Amazon S3
- JSON Web Tokens
- Multer and express-rate-limit

## Prerequisites

- Node.js and npm
- A PostgreSQL database
- An AWS account with an S3 bucket and credentials that can read and write
  objects in that bucket

## Getting started

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/mohakchakraborty2004/DropLinq.git
   cd DropLinq
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
   JWT_SECRET="replace-with-a-long-random-secret"
   AWS_ACCESS_KEY_ID="your-access-key-id"
   AWS_SECRET_ACCESS_KEY="your-secret-access-key"
   AWS_REGION="your-aws-region"
   AWS_S3_BUCKET_NAME="your-bucket-name"
   HOST="localhost:8000"
   ```

3. Apply the Prisma schema and generate the client:

   ```bash
   npm run db
   npx prisma generate --schema src/db/prisma/schema.prisma
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

The API listens on `http://localhost:8000`.

## API reference

All endpoints are prefixed with `/api/v1`.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/user/signup` | No | Create an account, or sign in to an existing account |
| `POST` | `/file/upload` | Bearer token | Upload a file (maximum 5 MB) |
| `GET` | `/file/download/:fileId` | No | Download a file by its ID |
| `GET` | `/file/:fileId` | Bearer token | Get a file's name, MIME type, and size |
| `GET` | `/file/health/check` | No | Check that the file router is available |

### Create an account or sign in

```bash
curl -X POST http://localhost:8000/api/v1/user/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"password"}'
```

The response includes a `token`. Supply it as a bearer token to protected
routes.

### Upload a file

```bash
curl -X POST http://localhost:8000/api/v1/file/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@./example.pdf"
```

### Download a file

```bash
curl -OJ http://localhost:8000/api/v1/file/download/FILE_ID
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run the API with `nodemon` and `ts-node` |
| `npm run build` | Compile TypeScript into `dist` |
| `npm start` | Run the compiled application |
| `npm run db` | Create and apply a development Prisma migration |

## Project structure

```text
src/
├── db/                 # Prisma client and database schema
├── middleware/         # JWT authentication middleware
├── routes/             # User and file API routes
├── types/              # Shared types
├── utils/              # Rate limiters
└── index.ts             # Express application entry point
```

Keep credentials and other secrets in `.env`; environment files are ignored by
Git.
