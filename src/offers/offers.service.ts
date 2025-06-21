import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { User } from '../users/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { WishesService } from '../wishes/wishes.service';
import { Offer } from './entities/offer.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOfferDto: CreateOfferDto, user: User) {
    const { itemId, amount } = createOfferDto;

    const wish = await this.wishesService.findOne(itemId);

    if (wish.owner.id === user.id) {
      throw new BadRequestException(
        'Вы не можете заплатить за свое собственное желание',
      );
    }
    const totalRaised = +wish.raised + +amount;

    if (totalRaised > +wish.price) {
      throw new BadRequestException(
        'Сумма предложения превышает оставшуюся сумму',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.wishesService.updateRaised(itemId, totalRaised);
      const offer = await this.offerRepository.save({
        ...createOfferDto,
        user,
        item: wish,
      });
      await queryRunner.commitTransaction();
      return offer;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getOffer(id: number) {
    const offer = await this.offerRepository.findOneBy({
      id,
    });

    if (!offer) {
      throw new NotFoundException('Предложение не найдено');
    }

    return offer;
  }

  async getOffers() {
    const offers = await this.offerRepository.find({
      relations: ['item', 'user'],
    });

    return offers;
  }
}
