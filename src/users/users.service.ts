import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  create = async (createUserDto: User) => {
    const userExits = await this.prisma.user.findUnique({
      where: {
        email: createUserDto.email
      }
    })
    if (userExits) throw new HttpException('This email is already in use!', HttpStatus.BAD_REQUEST);
    const result = await this.prisma.user.create({
      data: {
        id: `UID-${uuidv4()}`,
        email: createUserDto.email,
        name: createUserDto.name
      }
    })
    return result;
  }

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'desc' }
    });
  }

  findOne = async (email: string) => {
    const findUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!findUser) throw new HttpException('Can not find user!', HttpStatus.NOT_FOUND);

    return findUser;
  };

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
