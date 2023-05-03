import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtTokenStrategy } from './strategies/jwt_token.strategy';
import { RefreshJwtTokenStrategy } from './strategies/jwt_refresh.strategy';

@Module({
  imports: [UsersModule, PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    ConfigService,
    JwtTokenStrategy,
    RefreshJwtTokenStrategy,
  ],
})
export class AuthModule {}
