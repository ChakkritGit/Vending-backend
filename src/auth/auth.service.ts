import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { Role, Users } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { jwtDecode } from 'jwt-decode'
import { TokenType } from 'src/types/global'
import { UserLoginWithFingerType } from 'src/types/userType'

@Injectable()
export class AuthService {
  constructor (
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login (loginBody: CreateAuthDto) {
    const { username, password } = loginBody

    const user = await this.prisma.users.findFirst({
      where: { username: username.toLocaleLowerCase() },
    })

    if (!user)
      throw new HttpException('ไม่พบชื่อผู้ใช้นี้!', HttpStatus.NOT_FOUND)

    if (!user.status)
      throw new HttpException(
        'ชื่อผู้ใช้นี้ถูกปิดใช้งานแล้ว!',
        HttpStatus.BAD_REQUEST,
      )

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid)
      throw new HttpException('รหัสผ่านไม่ถูกต้อง!', HttpStatus.BAD_REQUEST)

    const token = this.jwtService.sign({
      id: user.id,
      display: user.display,
      role: user.role,
      status: user.status,
    })

    const result = {
      id: user.id,
      username: user.username,
      display: user.display,
      picture: user.picture,
      status: user.status,
      role: user.role,
      token: token,
    }

    return result
  }

  async loginWithFingerprint (loginBody: UserLoginWithFingerType) {
    const { bid } = loginBody

    const user = await this.prisma.users.findFirst({
      where: { biometrics: { some: { id: bid } } },
    })

    if (!user)
      throw new HttpException('ไม่พบชื่อผู้ใช้นี้!', HttpStatus.NOT_FOUND)

    if (!user.status)
      throw new HttpException(
        'ชื่อผู้ใช้นี้ถูกปิดใช้งานแล้ว!',
        HttpStatus.BAD_REQUEST,
      )

    const token = this.jwtService.sign({
      id: user.id,
      display: user.display,
      role: user.role,
      status: user.status,
    })

    const result = {
      id: user.id,
      username: user.username,
      display: user.display,
      picture: user.picture,
      status: user.status,
      role: user.role,
      token: token,
    }

    return result
  }

  async reset (id: string, updateAuthDto: Users) {
    const { newPassword, oldPassword } = updateAuthDto as unknown as {
      newPassword: string
      oldPassword: string
    }
    const user = await this.prisma.users.findFirst({
      where: { id },
    })
    if (!user) throw new HttpException('ไม่พบผู้ใช้!', HttpStatus.NOT_FOUND)
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordValid)
      throw new HttpException('รหัสผ่านเก่าไม่ถูกต้อง!', HttpStatus.BAD_REQUEST)
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await this.prisma.users.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    })
    return 'รีเซ็ตรหัสผ่านสำเร็จแล้ว!'
  }

  async verifyDrug (
    body: { username: string; password: string },
    authHeader: string,
  ) {
    if (!authHeader) {
      throw new HttpException('ไม่พบ Token!', HttpStatus.BAD_REQUEST)
    }

    const { username, password } = body

    try {
      const token = authHeader.split(' ')[1]
      const decoded: TokenType = await jwtDecode(token)
      const user = await this.prisma.users.findFirst({
        where: { username: username.toLocaleLowerCase() },
      })
      if (!user)
        throw new HttpException('ไม่พบชื่อผู้ใช้นี้!', HttpStatus.NOT_FOUND)
      if (!user.status)
        throw new HttpException(
          'ชื่อผู้ใช้นี้ถูกปิดใช้งานแล้ว!',
          HttpStatus.BAD_REQUEST,
        )
      const isPasswordValid = await bcrypt.compare(password, user.password)
      if (!isPasswordValid)
        throw new HttpException('รหัสผ่านไม่ถูกต้อง!', HttpStatus.BAD_REQUEST)

      if (decoded.role === 'NURSE' || user.role === 'NURSE') {
        throw new HttpException('คุณไม่มีสิทธ์ยืนยัน!', HttpStatus.BAD_REQUEST)
      }

      if (decoded.id === user.id) {
        throw new HttpException(
          'คุณไม่มีสิทธ์ยืนยันให้ตัวเอง!',
          HttpStatus.BAD_REQUEST,
        )
      }

      return 'OVERRIDDEN'
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
