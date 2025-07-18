import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  HttpCode,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { Users } from '@prisma/client'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { UserType } from 'src/types/userType'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/users'
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
    @Body() createUserDto: UserType,
  ) {
    if (file) {
      createUserDto.picture = `/uploads/users/${file.filename}`
    }

    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/users'
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
    @Body() updateUserDto: Users,
  ) {
    if (file) {
      updateUserDto.picture = `/uploads/users/${file.filename}`
    }

    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
