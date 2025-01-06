import { Response } from 'express';
import { Controller, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/file-filter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/file-namer.helper';
import { FilesService } from './files.service';


@Controller('files')
export class FilesController {

  constructor(
    private readonly filesService: FilesService,
  ) {}

  @Get('product/:file')
  downloadFile(
    @Res() res: Response,
    @Param('file') file: string
  ) {
    const filePath = this.filesService.downloadFile(file);
    res.sendFile(filePath);
  }

  @Post('product')
  @UseInterceptors(FileInterceptor('file', {
    fileFilter,
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.filesService.uploadFile(file);
  }



}
