import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUserId } from '../shared/decorators/get-user.decorator';
import { ValidationFilter } from '../shared/filters/validation.filter';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { PasswordInterceptor } from '../shared/interceptors/password.interceptor';
import { AuthGuardJwt } from '../shared/guards/auth-quard-jwt.service';

@UseGuards(AuthGuardJwt)
@UseInterceptors(PasswordInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  findOwn(@GetUserId() id: number) {
    return this.usersService.findById(id);
  }

  @Patch('me')
  @UseFilters(ValidationFilter)
  update(@GetUserId() id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Get('me/wishes')
  getOwnWishes(@GetUserId() id: number) {
    return this.usersService.getOwnWishes(id);
  }

  @Get(':username')
  findOne(@Param('username') username: string) {
    return this.usersService.findOne(username);
  }

  @Get(':username/wishes')
  getWishes(@Param('username') username: string) {
    return this.usersService.findWishes(username);
  }

  @Post('find')
  findMany(@Body() findUsersDto: FindUsersDto) {
    return this.usersService.findMany(findUsersDto);
  }
}
