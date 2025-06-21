import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HashService } from '../hash/hash.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashService: HashService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validatePassword(username: string, password: string) {
    const user = await this.usersService.findOne(username, true);
    const isMatch = await this.hashService.verifyPassword(
      password,
      user.password,
    );
    if (user && isMatch) {
      return user;
    } else {
      throw new UnauthorizedException('Username or password is invalid');
    }
  }

  async signIn(userId: number) {
    const token = await this.jwtService.signAsync({ sub: userId });
    return { access_token: token };
  }
}
