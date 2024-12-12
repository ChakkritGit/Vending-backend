import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Users } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private readonly jwtService: JwtService) { }

  async login(loginBody: CreateAuthDto) {
    const { username, password } = loginBody
    const user = await this.prisma.users.findFirst({
      where: { username }
    })
    if (!user) throw new HttpException('This username is not found!', HttpStatus.NOT_FOUND);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new HttpException('Invalid password!', HttpStatus.BAD_REQUEST);
    const token = this.jwtService.sign({ id: user.id, display: user.display, role: user.role, status: user.status })
    const response = {
      display: user.display,
      picture: user.picture,
      status: user.status,
      token: token
    }
    return response;
  }

  reset(id: number, updateAuthDto: Users) {
    return `This action updates a #${id} auth ${updateAuthDto.password}`;
  }
}
