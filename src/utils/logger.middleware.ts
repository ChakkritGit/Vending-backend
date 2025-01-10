import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  logger: Logger
  use(req: Request, res: Response, next: NextFunction) {
    this.logger = new Logger('SYSTEM')
    const logFolder = path.join(__dirname, process.env.NODE_ENV === 'development' ? '../..' : '..', 'logs');
    const logFileName = `${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(logFolder, logFileName);

    if (!fs.existsSync(logFolder)) {
      fs.mkdirSync(logFolder);
    }
    const currentTime = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
    const startTime = Date.now();
    res.on('finish', () => {
      const elapsedTime = Date.now() - startTime;
      const logMessage = `${currentTime} - ${req.method} ${req.originalUrl} ${res.statusCode} [ ${res.statusMessage} ] - Content-Length: ${res.get('Content-Length') || 0} - Time: ${elapsedTime}ms\n`;

      fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
          this.logger.error('Failed to write to log file:', err);
        }
      });
    });

    next();
  }
}

