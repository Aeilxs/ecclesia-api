import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User, UserDocument } from 'src/common/_schemas/user.schema';
import { CreateUserDto } from '../common/_dtos/create_user.dto';
import { UpdateUserDto } from '../common/_dtos/update_user.dto';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/common/guards/jwt_token.guard';

@UseGuards(AccessTokenGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(): Promise<User[]> {
    return (await this.usersService.findAll()).map((x) => new User(x));
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<UserDocument> {
    return this.usersService.delete(id);
  }
}
