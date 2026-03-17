import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const accessKey = process.env.AWS_ACCESS_KEY_ID;
const isPlaceholder = accessKey?.includes("placeholder") || !accessKey;

export const isS3Enabled = () => !isPlaceholder && !!process.env.S3_BUCKET_NAME;

const s3Client = isS3Enabled()
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

export async function generatePresignedUrl(key, contentType) {
  if (!isS3Enabled()) {
    throw new Error("S3_NOT_CONFIGURED");
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
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
  if (!isS3Enabled()) {
    throw new Error("S3_NOT_CONFIGURED");
  }

  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}

