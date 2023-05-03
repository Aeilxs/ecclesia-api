import { IsString, IsEmail } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
  refreshToken?: string;
}
