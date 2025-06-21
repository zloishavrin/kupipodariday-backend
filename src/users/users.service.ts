import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { HashService } from '../hash/hash.service';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FindUsersDto } from './dto/find-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, password, avatar, about } = createUserDto;

    const foundUser = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });

    if (foundUser) {
      throw new ConflictException(
        'Пользователь с таким email или username уже зарегистрирован',
      );
    }

    const hashedPassword = await this.hashService.hashPassword(password);

    const newUser = this.userRepository.create({
      email,
      username,
      avatar,
      about,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(newUser);

    return savedUser.toJSON();
  }

  async findOne(query: string, includePassword = false) {
    const user = await this.userRepository.findOne({
      where: { username: query },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return includePassword ? user : user.toJSON();
  }

  async findMany(query: FindUsersDto) {
    if (!query.query) return [];

    const users = await this.userRepository.find({
      where: [
        { username: Like(`%${query.query}%`) },
        { email: Like(`%${query.query}%`) },
      ],
    });

    return users.map((user) => user.toJSON());
  }

  async findById(id: number) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.toJSON();
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, username, email } = updateUserDto;

    if (username) {
      const userByUsername = await this.userRepository.findOne({
        where: { username },
      });
      if (userByUsername && userByUsername.id !== id) {
        throw new ConflictException(
          'Пользователь с таким именем пользователя уже существует',
        );
      }
    }

    if (email) {
      const userByEmail = await this.userRepository.findOne({
        where: { email },
      });
      if (userByEmail && userByEmail.id !== id) {
        throw new ConflictException(
          'Пользователь с таким адресом электронной почты уже существует',
        );
      }
    }

    if (password) {
      updateUserDto.password = await this.hashService.hashPassword(password);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  async getOwnWishes(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'wishes',
        'wishes.owner',
        'wishes.offers',
        'wishes.offers.user',
      ],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes.map((wish) =>
      typeof wish.toJSON === 'function' ? wish.toJSON() : wish,
    );
  }

  async findWishes(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      relations: [
        'wishes',
        'wishes.offers',
        'wishes.offers.item',
        'wishes.offers.user',
        'wishes.offers.item.owner',
      ],
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user.wishes.map((wish) =>
      typeof wish.toJSON === 'function' ? wish.toJSON() : wish,
    );
  }
}
