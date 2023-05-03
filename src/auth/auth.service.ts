import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from 'src/common/_dtos/create_user.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Tokens } from 'src/common/_types/tokens.type';
import * as argon2 from 'argon2';
import { CredentialsDto } from 'src/common/_dtos/credentials.dto';
import { LoginResponse } from 'src/common/_types/res.login.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    await this.checkUserExists(createUserDto.email, "L'email est déjà utilisé");
    const { password, ...rest } = createUserDto;
    const newUser = await this.usersService.create({
      ...rest,
      password: await argon2.hash(password),
    });

    const tokens = await this.getTokens(newUser._id, newUser.email);
    await this.updateRefreshToken(newUser._id, newUser.email);
    return {
      ...tokens,
      email: newUser.email,
      id: newUser._id.toString(),
    };
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.usersService.update(userId, {
      refreshToken: await argon2.hash(refreshToken),
    });
  }

  async signin(creds: CredentialsDto) {
    const user = await this.usersService.findByEmail(creds.email);
    if (!user) {
      throw new BadRequestException('Identifiants invalide');
    }

    if (!argon2.verify(user.password, creds.password)) {
      throw new BadRequestException('Identifiants invalide');
    }

    const tokens = await this.getTokens(user._id, user.email);
    await this.updateRefreshToken(user._id, user.email);

    return {
      ...tokens,
      email: user.email,
      id: user._id.toString(),
    };
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null });
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    return {
      accessToken: await this.createAccessToken(userId, email),
      refreshToken: await this.createRefreshToken(userId, email),
    };
  }

  // prettier-ignore
  private async createAccessToken(userId: string,email: string): Promise<string> {
    const expiresIn = this.configService.get<string>('JWT_TOKEN_EXPIRATION');
    const secret = this.configService.get<string>('JWT_SECRET');
    return this.jwtService.signAsync({ sub: userId, email }, { secret, expiresIn });
  }

  // prettier-ignore
  private async createRefreshToken(userId: string, email: string): Promise<string> {
    const expiresIn = this.configService.get<string>('REFRESH_JWT_EXPIRATION');
    const secret = this.configService.get<string>('REFRESH_JWT_SECRET');
    return this.jwtService.signAsync({ sub: userId, email }, { secret, expiresIn });
  }

  private async checkUserExists(email: string, msg: string): Promise<void> {
    const userExists = await this.usersService.findByEmail(email);
    if (userExists) {
      throw new BadRequestException(msg);
    }
  }

  // prettier-ignore
  async refreshTokens(userId: string, refreshToken: string): Promise<LoginResponse> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    if (!(await argon2.verify(user.refreshToken, refreshToken))) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      email: user.email,
      id: user._id.toString(),
    };
  }
}
