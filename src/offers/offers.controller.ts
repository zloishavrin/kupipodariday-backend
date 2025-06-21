import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { PasswordInterceptor } from '../shared/interceptors/password.interceptor';
import { AuthGuardJwt } from '../shared/guards/auth-quard-jwt.service';
import { GetUser } from '../shared/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@UseInterceptors(PasswordInterceptor)
@UseGuards(AuthGuardJwt)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  create(@Body() createOfferDto: CreateOfferDto, @GetUser() user: User) {
    return this.offersService.create(createOfferDto, user);
  }

  @Get()
  findAll() {
    return this.offersService.getOffers();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.offersService.getOffer(id);
  }
}
