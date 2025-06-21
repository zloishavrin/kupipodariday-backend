import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/create-wish.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Wish } from './entities/wish.entity';
import { DataSource, In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { WishErrors, WishesLimits } from './wishes.constants';
import { UpdateWishDto } from './dto/update-wish.dto';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish)
    private readonly wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createWishDto: CreateWishDto, user: User) {
    return await this.wishRepository.save({ ...createWishDto, owner: user });
  }

  async findOne(id: number) {
    const wish = await this.wishRepository.findOne({
      where: { id },
      relations: ['owner', 'offers', 'offers.user'],
    });

    if (!wish) {
      throw new NotFoundException(WishErrors.NotFound);
    }

    return wish;
  }

  async findById(id: number) {
    const wish = await this.findOne(id);
    return wish.toJSON();
  }

  async findLatestWishes() {
    const wishes = await this.wishRepository.find({
      order: { createdAt: 'DESC' },
      take: WishesLimits.latest,
      relations: ['owner', 'offers', 'offers.user'],
    });

    return wishes.map((wish) => wish.toJSON()) ?? [];
  }

  async findTopWishes() {
    const wishes = await this.wishRepository.find({
      order: { copied: 'DESC' },
      take: WishesLimits.mostCopied,
      relations: ['owner', 'offers', 'offers.user'],
    });

    return wishes.map((wish) => wish.toJSON()) ?? [];
  }

  async update(wishId: number, updateWishDto: UpdateWishDto, userId: number) {
    const wish = await this.findOne(wishId);

    if (wish.owner.id !== userId) {
      throw new BadRequestException(WishErrors.NotOwner);
    }

    const isPriceChanged =
      updateWishDto.price !== undefined && updateWishDto.price !== wish.price;
    const hasContributions = wish.raised > 0;

    if (isPriceChanged && hasContributions) {
      throw new BadRequestException(WishErrors.CannotChangePrice);
    }

    await this.wishRepository.update(wishId, updateWishDto);
    const updatedWish = await this.findOne(wishId);

    return updatedWish.toJSON();
  }

  async remove(wishId: number, userId: number) {
    const wish = await this.findOne(wishId);

    if (wish.owner.id !== userId) {
      throw new BadRequestException(WishErrors.NotOwner);
    }

    await this.wishRepository.delete(wishId);
    return wish.toJSON();
  }

  async copy(wishId: number, user: User) {
    const originalWish = await this.findOne(wishId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.wishRepository.update(wishId, {
        copied: originalWish.copied + 1,
      });
      const { name, link, image, price, description } = originalWish;
      const newWish = await this.create(
        { name, link, image, price, description },
        user,
      );

      const savedWish = await this.findOne(newWish.id);

      if (!savedWish) {
        throw new NotFoundException(WishErrors.NotFound);
      }

      await queryRunner.commitTransaction();

      return savedWish.toJSON();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findManyByIds(wishIds: number[]) {
    if (!wishIds.length) return [];

    return await this.wishRepository.find({
      where: { id: In(wishIds) },
    });
  }

  async getManyByIds(wishIds: number[]) {
    const wishes = await this.findManyByIds(wishIds);
    return wishes.map((wish) => wish.toJSON());
  }

  async updateRaised(id: number, raisedAmount: number) {
    await this.wishRepository.update(id, { raised: raisedAmount });
    const updatedWish = await this.findOne(id);
    return updatedWish.toJSON();
  }
}
