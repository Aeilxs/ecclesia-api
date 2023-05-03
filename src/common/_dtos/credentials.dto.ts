import { IsString, IsEmail } from 'class-validator';

export class CredentialsDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
