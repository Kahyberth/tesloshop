import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { errorHandler } from 'src/common/types/errorHandler.type';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './type/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });
    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true },
    });

    if (!user) throw new UnauthorizedException('Credentials is not valid');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials is not valid (password)');

    return {
      ...user,
      token: this.getJwtToken({ email: user.email }),
    };
  }

  private handleDbError(error: errorHandler): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error.detail);

    throw new InternalServerErrorException(error.detail);
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }
}
