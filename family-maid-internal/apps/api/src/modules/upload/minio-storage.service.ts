// MinioStorageService — upload file lên MinIO (S3-compatible self-hosted)

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class MinioStorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('minio.endpoint');
    const port = this.config.get<number>('minio.port');
    const accessKey = this.config.get<string>('minio.accessKey');
    const secretKey = this.config.get<string>('minio.secretKey');
    this.bucket = this.config.get<string>('minio.bucketName') ?? 'family-maid';
    this.publicUrl = `http://${endpoint}:${port}`;

    this.s3 = new S3Client({
      endpoint: `http://${endpoint}:${port}`,
      region: 'us-east-1', // MinIO bắt buộc có region (bất kỳ)
      credentials: { accessKeyId: accessKey!, secretAccessKey: secretKey! },
      forcePathStyle: true, // MinIO dùng path-style (không dùng subdomain)
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: 'avatars' | 'contracts' | 'invoices' | 'annexes',
  ): Promise<string> {
    const ext = path.extname(file.originalname);
    const key = `${folder}/${uuidv4()}${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
    } catch (err) {
      throw new InternalServerErrorException(`Upload thất bại: ${(err as Error).message}`);
    }

    return `${this.publicUrl}/${this.bucket}/${key}`;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Trích key từ URL: http://minio:9000/family-maid/avatars/uuid.jpg → avatars/uuid.jpg
    const key = fileUrl.split(`/${this.bucket}/`)[1];
    if (!key) return;

    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: expiresInSeconds,
    });
  }
}
