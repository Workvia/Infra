import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client (works with AWS S3 and Cloudflare R2)
const s3Client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint: process.env.S3_ENDPOINT, // For Cloudflare R2
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export class StorageService {
  /**
   * Upload a file to S3/R2
   */
  static async uploadFile(params: {
    key: string;
    body: Buffer | Uint8Array | string;
    contentType: string;
    metadata?: Record<string, string>;
  }): Promise<{ key: string; url: string }> {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      Metadata: params.metadata,
    });

    await s3Client.send(command);

    // Generate public URL (or signed URL for private buckets)
    const url = process.env.S3_ENDPOINT
      ? `${process.env.S3_ENDPOINT}/${BUCKET_NAME}/${params.key}`
      : `https://${BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${params.key}`;

    return { key: params.key, url };
  }

  /**
   * Upload a document
   */
  static async uploadDocument(params: {
    clientId: string;
    documentId: string;
    file: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<{ key: string; url: string }> {
    const key = `documents/${params.clientId}/${params.documentId}/${params.fileName}`;

    return await this.uploadFile({
      key,
      body: params.file,
      contentType: params.mimeType,
      metadata: {
        clientId: params.clientId,
        documentId: params.documentId,
        originalFileName: params.fileName,
      },
    });
  }

  /**
   * Upload a generated proposal
   */
  static async uploadProposal(params: {
    clientId: string;
    proposalId: string;
    file: Buffer;
    format: "pdf" | "docx";
  }): Promise<{ key: string; url: string }> {
    const extension = params.format === "pdf" ? "pdf" : "docx";
    const mimeType =
      params.format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const key = `proposals/${params.clientId}/${params.proposalId}.${extension}`;

    return await this.uploadFile({
      key,
      body: params.file,
      contentType: mimeType,
      metadata: {
        clientId: params.clientId,
        proposalId: params.proposalId,
        format: params.format,
      },
    });
  }

  /**
   * Upload a policy comparison report
   */
  static async uploadComparison(params: {
    clientId: string;
    comparisonId: string;
    file: Buffer;
    format: "pdf" | "docx";
  }): Promise<{ key: string; url: string }> {
    const extension = params.format === "pdf" ? "pdf" : "docx";
    const mimeType =
      params.format === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const key = `comparisons/${params.clientId}/${params.comparisonId}.${extension}`;

    return await this.uploadFile({
      key,
      body: params.file,
      contentType: mimeType,
      metadata: {
        clientId: params.clientId,
        comparisonId: params.comparisonId,
        format: params.format,
      },
    });
  }

  /**
   * Get a signed URL for downloading a file
   */
  static async getDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  }

  /**
   * Delete a file
   */
  static async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  }

  /**
   * Get file from S3
   */
  static async getFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error("File not found");
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  }
}

// Helper function to generate safe file keys
export function generateFileKey(params: {
  folder: "documents" | "proposals" | "comparisons" | "cache-backups";
  clientId?: string;
  fileName: string;
}): string {
  const timestamp = Date.now();
  const sanitizedFileName = params.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");

  if (params.clientId) {
    return `${params.folder}/${params.clientId}/${timestamp}-${sanitizedFileName}`;
  }

  return `${params.folder}/${timestamp}-${sanitizedFileName}`;
}