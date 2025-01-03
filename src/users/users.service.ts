import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Users } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { getDateFormat } from 'src/utils/date.format';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  private async deleteFile(filePath: string) {
    try {
      await fs.unlink(`.${filePath}`);
      console.log(`🗑️  this image: [${filePath}] has been deleted!`)
    } catch (error) {
      console.error(`Failed to delete file: [${filePath}]!`);
    }
  }

  async create(createUserDto: Users) {
    const { username, password, display, picture, role, comment } = createUserDto;

    const userExits = await this.prisma.users.findUnique({
      where: { username: username },
    });

    if (userExits) {
      if (picture) await this.deleteFile(picture);
      throw new HttpException('This username is already in use!', HttpStatus.BAD_REQUEST);
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

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
          username: username.toLocaleLowerCase(),
          password: hashedPassword,
          display: display,
          picture: picture,
          role: role,
          comment: comment,
          createdAt: getDateFormat(new Date()),
          updatedAt: getDateFormat(new Date()),
        },
      });

      return result;
    } catch (error) {
      if (picture) await this.deleteFile(picture);

      throw new HttpException(
        'An error occurred while creating the user!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAll() {
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
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
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
        updatedAt: true
      },
      where: { id: id },
    });

    if (!user) throw new HttpException('User not found!', HttpStatus.NOT_FOUND);

    return user;
  };

  async update(id: string, updateUserDto: Users) {
    const { username, display, picture, role, comment, status } = updateUserDto
    const user = await this.prisma.users.findUnique({
      where: { id },
    });

    if (!user) {
      await this.deleteFile(updateUserDto.picture);
      throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    }
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
        updatedAt: true
      },
      where: { id },
      data: {
        username: username.toLocaleLowerCase(),
        display: display,
        picture: picture,
        role: role,
        status: String(status) === "0" ? false : true,
        comment: comment,
        updatedAt: getDateFormat(new Date()),
      }
    })

    await this.deleteFile(result.picture);

    return result;
  }

  async remove(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id: id },
    });

    if (!user) throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    const result = await this.prisma.users.delete({
      where: { id }
    })
    await this.deleteFile(result.picture);
    return "this user has been deleted!";
  }
}
