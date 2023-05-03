import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/common/_dtos/create_user.dto';
import { CredentialsDto } from 'src/common/_dtos/credentials.dto';
import { AuthRequest } from 'src/common/_types/req.auth.interface';
import { AccessTokenGuard } from 'src/common/guards/jwt_token.guard';
import { RefreshTokenGuard } from 'src/common/guards/jwt_token_refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('signin')
  signin(@Body() creds: CredentialsDto) {
    return this.authService.signin(creds);
  }

  @UseGuards(AccessTokenGuard)
  @Get('logout')
  logout(@Req() req: AuthRequest) {
    this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('refresh')
  refreshTokens(@Req() req: AuthRequest) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
