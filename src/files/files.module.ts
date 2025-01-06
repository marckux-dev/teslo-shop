import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [FilesService],
  controllers: [FilesController],
  imports: [ConfigModule]
})
export class FilesModule {}
