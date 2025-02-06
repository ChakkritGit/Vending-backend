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
  BadRequestException,
} from '@nestjs/common'
import { UsersService } from './users.service'
import { Users } from '@prisma/client'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

@Controller('users')
export class UsersController {
  constructor (private readonly usersService: UsersService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/users'

          if (!existsSync('./uploads')) {
            mkdirSync('./uploads')
          }

          if (!existsSync('./uploads/users')) {
            mkdirSync('./uploads/users')
          }

          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const fileExtension = extname(file.originalname)
          const fileName = `user-${uuidv4()}${fileExtension}`
          callback(null, fileName)
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  create (
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserDto: Users,
  ) {
    if (file) {
      const imageUrl = `/uploads/users/${file.filename}`
      createUserDto.picture = imageUrl
    }

    return this.usersService.create(createUserDto)
  }

  @Get()
  findAll () {
    return this.usersService.findAll()
  }

  @Get(':id')
  findOne (@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(200)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = './uploads/users'

          if (!existsSync('./uploads')) {
            mkdirSync('./uploads')
          }

          if (!existsSync('./uploads/users')) {
            mkdirSync('./uploads/users')
          }

          callback(null, uploadPath)
        },
        filename: (req, file, callback) => {
          const fileExtension = extname(file.originalname)
          const fileName = `img-${uuidv4()}${fileExtension}`
          callback(null, fileName)
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
    }),
  )
  update (
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
    @Body() updateUserDto: Users,
  ) {
    if (file) {
      const imageUrl = `/uploads/users/${file.filename}`
      updateUserDto.picture = imageUrl
    }

    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  remove (@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
