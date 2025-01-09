import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Role, Users } from '@prisma/client';
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
      where: { username: username.toLocaleLowerCase() }
    })
    if (!user) throw new HttpException('This username is not found!', HttpStatus.NOT_FOUND);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new HttpException('Invalid password!', HttpStatus.BAD_REQUEST);
    const token = this.jwtService.sign({ id: user.id, display: user.display, role: user.role, status: user.status })
    const result = {
      id: user.id,
      username: user.username,
      display: user.display,
      picture: user.picture,
      status: user.status,
      role: user.role,
      token: token
    }
    return result;
  }

  async reset(id: string, updateAuthDto: Users) {
    const { newPassword, oldPassword } = updateAuthDto as unknown as { newPassword: string, oldPassword: string }
    const user = await this.prisma.users.findFirst({
      where: { id }
    })
    if (!user) throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) throw new HttpException('The old password is incorrect!', HttpStatus.BAD_REQUEST);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({
      where: { id },
      data: {
        password: hashedPassword
      }
    })
    return "Password has been reset success!";
  }
}
