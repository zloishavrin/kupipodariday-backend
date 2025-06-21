import { Body, Controller, Post, UseFilters, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthGuardLocal } from '../shared/guards/auth-guard-local.service';
import { GetUserId } from '../shared/decorators/get-user.decorator';
import { ValidationFilter } from '../shared/filters/validation.filter';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}
  @UseGuards(AuthGuardLocal)
  @Post('signin')
  login(@GetUserId() userId: number) {
    return this.authService.signIn(userId);
  }

  @Post('signup')
  @UseFilters(ValidationFilter)
  signup(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
