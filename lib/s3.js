import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.AWS_REGION;
const bucket = process.env.S3_BUCKET_NAME;

const s3Client =
  region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? new S3Client({
        region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      })
    : null;

/**
 * Generate a PUT presigned URL valid for 15 minutes.
 * @param {string} key
 * @param {string} contentType
 */
export async function generatePresignedUrl(key, contentType) {
  if (!s3Client || !bucket) {
    throw new Error("S3 is not configured");
  }

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });
  return url;
}

/**
 * Generate a GET presigned URL valid for 1 hour.
 * @param {string} key
 */
export async function generateDownloadUrl(key) {
  if (!s3Client || !bucket) {
    throw new Error("S3 is not configured");
  }

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

