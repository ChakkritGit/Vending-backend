import { Controller, Post, Body, Patch, Param, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Users } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(200)
  login(@Body() createAuthDto: Users) {
    return this.authService.login(createAuthDto);
  }

  @Patch('reset/:id')
  reset(@Param('id') id: string, @Body() updateAuthDto: Users) {
    return this.authService.reset(+id, updateAuthDto);
  }
}
