import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { PasswordInterceptor } from '../shared/interceptors/password.interceptor';
import { AuthGuardJwt } from '../shared/guards/auth-quard-jwt.service';
import { ValidationFilter } from '../shared/filters/validation.filter';
import { GetUser, GetUserId } from '../shared/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@UseInterceptors(PasswordInterceptor)
@UseGuards(AuthGuardJwt)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  findAll() {
    return this.wishlistsService.getWishLists();
  }

  @Post()
  @UseFilters(ValidationFilter)
  async create(
    @Body() createWishlistDto: CreateWishlistDto,
    @GetUser() user: User,
  ) {
    return await this.wishlistsService.create(createWishlistDto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.wishlistsService.findById(id);
  }

  @Patch(':id')
  @UseFilters(ValidationFilter)
  update(
    @Param('id') wishId: number,
    @Body() updateWishlistDto: UpdateWishlistDto,
    @GetUserId() userId: number,
  ) {
    return this.wishlistsService.update(wishId, updateWishlistDto, userId);
  }

  @Delete(':id')
  removeOne(@Param('id') wishId: number, @GetUserId() userId: number) {
    return this.wishlistsService.remove(wishId, userId);
  }
}
