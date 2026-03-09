// FileUploadController — upload avatar, hợp đồng, hóa đơn lên MinIO

import {
  Controller, Post, UseInterceptors, UploadedFile,
  ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
  Query, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MinioStorageService } from './minio-storage.service';

const ALLOWED_FOLDERS = ['avatars', 'contracts', 'invoices', 'annexes'] as const;
type UploadFolder = typeof ALLOWED_FOLDERS[number];

@Controller('upload')
export class FileUploadController {
  constructor(private readonly minioService: MinioStorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|pdf|doc|docx)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Query('folder') folder: string,
  ): Promise<{ url: string }> {
    if (!ALLOWED_FOLDERS.includes(folder as UploadFolder)) {
      throw new BadRequestException(`folder phải là một trong: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    const url = await this.minioService.uploadFile(file, folder as UploadFolder);
    return { url };
  }
}
