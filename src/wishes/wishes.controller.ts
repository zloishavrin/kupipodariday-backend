import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UseFilters,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { AuthGuardJwt } from '../shared/guards/auth-quard-jwt.service';
import { User } from '../users/entities/user.entity';
import { GetUser, GetUserId } from '../shared/decorators/get-user.decorator';
import { PasswordInterceptor } from '../shared/interceptors/password.interceptor';
import { OfferInterceptor } from '../shared/interceptors/offers.interceptor';
import { ValidationFilter } from '../shared/filters/validation.filter';

@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @UseGuards(AuthGuardJwt)
  @Post()
  create(@GetUser() user: User, @Body() createWishDto: CreateWishDto) {
    return this.wishesService.create(createWishDto, user);
  }

  @UseInterceptors(PasswordInterceptor)
  @Get('last')
  findLast() {
    return this.wishesService.findLatestWishes();
  }

  @UseInterceptors(PasswordInterceptor)
  @Get('top')
  findTop() {
    return this.wishesService.findTopWishes();
  }

  @UseInterceptors(PasswordInterceptor, OfferInterceptor)
  @UseGuards(AuthGuardJwt)
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.wishesService.findById(id);
  }

  @UseInterceptors(PasswordInterceptor)
  @UseGuards(AuthGuardJwt)
  @Patch(':id')
  @UseFilters(ValidationFilter)
  update(
    @Param('id') wishId: number,
    @Body() updateWishDto: UpdateWishDto,
    @GetUserId() userId: number,
  ) {
    return this.wishesService.update(wishId, updateWishDto, userId);
  }

  @UseInterceptors(PasswordInterceptor)
  @UseGuards(AuthGuardJwt)
  @Delete(':id')
  async removeOne(@Param('id') wishId: number, @GetUserId() userId: number) {
    return this.wishesService.remove(wishId, userId);
  }

  @UseInterceptors(PasswordInterceptor)
  @UseGuards(AuthGuardJwt)
  @Post(':id/copy')
  copyWish(@Param('id') wishId: number, @GetUser() user: User) {
    return this.wishesService.copy(wishId, user);
  }
}
