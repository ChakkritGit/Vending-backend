import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Users } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'
import { getDateFormat } from 'src/utils/date.format'
import * as bcrypt from 'bcrypt'
import * as fs from 'fs/promises'

@Injectable()
export class UsersService {
  logger: Logger
  constructor (private prisma: PrismaService) {
    this.logger = new Logger('SERVICE')
  }

  private async deleteFile (filePath: string) {
    try {
      await fs.unlink(`.${filePath}`)
      this.logger.log(`🗑️  this image: [${filePath}] has been deleted!`)
    } catch (error) {
      this.logger.error(`Failed to delete file: [${filePath}]!`)
    }
  }

  async create (createUserDto: Users) {
    const { username, password, display, picture, role, comment } =
      createUserDto

    const userExits = await this.prisma.users.findUnique({
      where: { username: username },
    })

    if (userExits) {
      if (picture) await this.deleteFile(picture)
      throw new HttpException(
        'ชื่อผู้ใช้นี้ถูกใช้ไปแล้ว!',
        HttpStatus.BAD_REQUEST,
      )
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10)

      const result = await this.prisma.users.create({
        select: {
          id: true,
          username: true,
          display: true,
          picture: true,
          role: true,
          status: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        },
        data: {
          id: `UID-${uuidv4()}`,
          username: username.toLowerCase(),
          password: hashedPassword,
          display: display,
          picture: picture,
          role: role,
          comment: comment,
          createdAt: getDateFormat(new Date()),
          updatedAt: getDateFormat(new Date()),
        },
      })

      return result
    } catch (error) {
      if (picture) await this.deleteFile(picture)

      throw new HttpException(
        'เกิดข้อผิดพลาดขณะเพิ่มผู้ใช้!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  findAll () {
    return this.prisma.users.findMany({
      select: {
        id: true,
        username: true,
        display: true,
        picture: true,
        role: true,
        status: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne (id: string) {
    const user = await this.prisma.users.findUnique({
      select: {
        id: true,
        username: true,
        display: true,
        picture: true,
        role: true,
        status: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { id: id },
    })

    if (!user) throw new HttpException('ไม่พบผู้ใช้!', HttpStatus.NOT_FOUND)

    return user
  }

  async update (id: string, updateUserDto: Users) {
    const { username, display, picture, role, comment, status } = updateUserDto

    const user = await this.prisma.users.findUnique({
      where: { id },
    })

    if (!user) {
      if (picture) await this.deleteFile(picture)
      throw new HttpException('ไม่พบผู้ใช้!', HttpStatus.NOT_FOUND)
    }

    const dataToUpdate: any = {
      username: username?.toLowerCase(),
      display,
      role,
      status: String(status) === '0' ? false : true,
      comment,
      updatedAt: getDateFormat(new Date()),
    }

    if (picture) {
      dataToUpdate.picture = picture
      await this.deleteFile(user.picture)
    }

    try {
      const result = await this.prisma.users.update({
        select: {
          id: true,
          username: true,
          display: true,
          picture: true,
          role: true,
          status: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        },
        where: { id },
        data: dataToUpdate,
      })

      return result
    } catch (error) {
      if (picture) await this.deleteFile(picture)
      throw new HttpException(
        'เกิดข้อผิดพลาดขณะแก้ไขผู้ใช้!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async remove (id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    })

    if (!user) throw new HttpException('ไม่พบผู้ใช้!', HttpStatus.NOT_FOUND)

    try {
      const result = await this.prisma.users.delete({
        where: { id },
      })
      await this.deleteFile(result.picture)
      return 'ผู้ใช้ถูกลบไปแล้ว!'
    } catch (error) {
      throw new HttpException(
        'เกิดข้อผิดพลาดขณะลบผู้ใช้!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }
}
