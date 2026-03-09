import { Module } from '@nestjs/common';
import { MinioStorageService } from './minio-storage.service';
import { FileUploadController } from './file-upload.controller';

@Module({
  providers: [MinioStorageService],
  controllers: [FileUploadController],
  exports: [MinioStorageService],
})
export class UploadModule {}
