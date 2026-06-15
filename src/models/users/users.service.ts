import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private UserRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.UserRepository.find();
  }
}
