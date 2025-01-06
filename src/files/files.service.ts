import { existsSync } from 'fs';
import { join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class FilesService {

  constructor(
    private readonly configService: ConfigService,
  ) {}

  downloadFile(file: string) {
    const filePath = join(__dirname, '..', '..', 'static', 'products', file);
    if (!existsSync(filePath)) {
      throw new BadRequestException('File not found');
    }
    return filePath;
  }



  // Method to upload a file
  uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File not uploaded');
    }
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`;
    return { secureUrl };
  }

}
