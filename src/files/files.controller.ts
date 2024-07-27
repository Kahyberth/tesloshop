import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer } from './fileNamer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './static/uploads',
        filename: (req, file, callback) => {
          fileNamer(req, file, (error, fileName) => {
            if (error) {
              callback(error, '');
            } else {
              callback(null, fileName || '');
            }
          });
        },
      }),
    }),
  )
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    return file;
  }
}
