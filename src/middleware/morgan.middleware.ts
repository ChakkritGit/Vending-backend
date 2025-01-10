import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import * as morgan from 'morgan';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: any, res: any, next: () => void): void {
    morgan(
      '⚡ [:date[iso]] - :method :url :status | :res[content-length] B - :response-time ms | [:user-agent] - HTTP/:http-version',
      {
        stream: {
          write: (message: string) => {
            // ใช้ Logger ของ NestJS
            this.logger.log(message.trim());
          },
        },
      },
    )(req, res, next);
  }
}
