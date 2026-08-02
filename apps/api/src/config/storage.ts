import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

const provider = process.env.STORAGE_PROVIDER || 'local';

if (provider === 'cloudinary') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const r2Client =
  provider === 'r2'
    ? new S3Client({
        region: 'auto',
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT || '',
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
        },
      })
    : null;

/**
 * Uploads a file to Cloudinary, Cloudflare R2, or stores it locally as a fallback.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<string> {
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(originalFilename)}`;

  if (provider === 'cloudinary') {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ram_ji_collection',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Cloudinary upload failed'));
          } else {
            resolve(result.secure_url);
          }
        }
      );
      uploadStream.end(fileBuffer);
    });
  }

  if (provider === 'r2' && r2Client) {
    const bucket = process.env.CLOUDFLARE_R2_BUCKET || '';
    const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: uniqueName,
      Body: fileBuffer,
      ContentType: mimeType,
    });

    await r2Client.send(command);
    return `${publicUrl.replace(/\/$/, '')}/${uniqueName}`;
  }

  // Fallback: Local upload
  const uploadsDir = path.join(__dirname, '../../../../uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, uniqueName);
  fs.writeFileSync(filepath, fileBuffer);

  const serverUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${serverUrl.replace(/\/$/, '')}/uploads/${uniqueName}`;
}
