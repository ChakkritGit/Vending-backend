import { Controller, Post, Body, Patch, Param, HttpCode, Headers } from '@nestjs/common';
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
  @HttpCode(200)
  reset(@Param('id') id: string, @Body() updateAuthDto: Users) {
    return this.authService.reset(id, updateAuthDto);
  }

  @Post('verify-drug')
  @HttpCode(200)
  verifyDrug(@Body() body: { username: string; password: string }, @Headers('authorization') authHeader: string) {
    return this.authService.verifyDrug(body, authHeader)
  }
}
