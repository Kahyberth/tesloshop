import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { errorHandler } from 'src/common/types/errorHandler.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);
    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.handleDbError(error);
    }
  }

  private handleDbError(error: errorHandler): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error.detail);

    throw new InternalServerErrorException(error.detail);
  }
}
