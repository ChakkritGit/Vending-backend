import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common'
import { DrugsService } from './drugs.service'
import { Drugs } from '@prisma/client'
import { extname, join } from 'path'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { existsSync, mkdirSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

@Controller('drugs')
export class DrugsController {
  constructor(private readonly drugsService: DrugsService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/drugs'
          if (!existsSync('./uploads')) mkdirSync('./uploads')
          if (!existsSync(uploadPath)) mkdirSync(uploadPath)
          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const ext = extname(file.originalname)
          const filename = `img-${uuidv4()}${ext}`
          callback(null, filename)
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createDrugDto: Drugs,
  ) {
    if (file) {
      createDrugDto.picture = `/uploads/drugs/${file.filename}`
    }

    return this.drugsService.create(createDrugDto)
  }

  @Get()
  findAll() {
    return this.drugsService.findAll()
  }

  @Get('exist')
  getExistDrug() {
    return this.drugsService.getExistDrug()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drugsService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/drugs'
          if (!existsSync('./uploads')) mkdirSync('./uploads')
          if (!existsSync(uploadPath)) mkdirSync(uploadPath)
          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const ext = extname(file.originalname)
          const filename = `img-${uuidv4()}${ext}`
          callback(null, filename)
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  update(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateDrugDto: Drugs,
  ) {
    if (file) {
      updateDrugDto.picture = `/uploads/drugs/${file.filename}`
    }

    return this.drugsService.update(id, updateDrugDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drugsService.remove(id)
  }
}
