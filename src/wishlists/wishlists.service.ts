import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { Repository } from 'typeorm';
import { WishesService } from '../wishes/wishes.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { User } from '../users/entities/user.entity';
import { WishListsErrors } from './wishlists.constants';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    private readonly wishesService: WishesService,
  ) {}

  async create(createWishlistDto: CreateWishlistDto, user: User) {
    const { itemsId, ...rest } = createWishlistDto;
    const items = await this.wishesService.findManyByIds(itemsId);
    const wishlist = await this.wishlistRepository.save({
      items,
      owner: user,
      ...rest,
    });
    return await this.findOne(wishlist.id);
  }

  async getWishLists() {
    const wishlists = await this.wishlistRepository.find({
      relations: ['owner', 'items'],
    });

    return wishlists.map((wishlist) => wishlist.toJSON());
  }

  async findOne(id: number) {
    const wishlist = await this.wishlistRepository.findOne({
      where: { id },
      relations: ['owner', 'items'],
    });

    if (!wishlist) {
      throw new NotFoundException(WishListsErrors.NotFound);
    }

    return wishlist;
  }

  async findById(id: number) {
    const wishlist = await this.findOne(id);
    return wishlist.toJSON();
  }

  async update(
    id: number,
    updateWishlistDto: UpdateWishlistDto,
    userId: number,
  ) {
    const wishlist = await this.findOne(id);

    if (wishlist.owner.id !== userId) {
      throw new BadRequestException(WishListsErrors.NotOwner);
    }

    const { itemsId, name, image, description } = updateWishlistDto;
    if (itemsId) {
      wishlist.items = await this.wishesService.findManyByIds(itemsId);
    }
    if (name) {
      wishlist.name = name;
    }
    if (image) {
      wishlist.image = image;
    }
    if (description) {
      wishlist.description = description;
    }

    await this.wishlistRepository.save(wishlist);
    return await this.findById(id);
  }

  async remove(wishlistId: number, userId: number) {
    const wishlist = await this.findOne(wishlistId);

    if (wishlist.owner.id !== userId) {
      throw new BadRequestException(WishListsErrors.NotOwner);
    }

    await this.wishlistRepository.delete(wishlistId);
    return wishlist.toJSON();
  }
}
