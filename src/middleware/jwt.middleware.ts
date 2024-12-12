import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      throw new UnauthorizedException('Token is missing');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // ใช้ secret ของคุณ
      req['user'] = decoded; // เพิ่มข้อมูลผู้ใช้ใน request
      next(); // เรียก middleware ถัดไป
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
