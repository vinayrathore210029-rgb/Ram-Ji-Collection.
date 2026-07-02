import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const r2Enabled = process.env.STORAGE_PROVIDER === 'r2';

const r2Client = r2Enabled
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
 * Uploads a file to Cloudflare R2 or stores it locally as a fallback.
 * Returns the public URL of the uploaded file.
 */
export async function uploadFile(
  fileBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<string> {
  const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${path.extname(originalFilename)}`;

  if (r2Enabled && r2Client) {
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
  } else {
    // Fallback: Local upload
    const uploadsDir = path.join(__dirname, '../../../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(filepath, fileBuffer);

    // Return relative URL or full server URL
    const serverUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${serverUrl.replace(/\/$/, '')}/uploads/${uniqueName}`;
  }
}
