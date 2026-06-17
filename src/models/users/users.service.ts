import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';

@Injectable()
export class UserService {
  create(arg0: { name: string; email: string; password: string; }): User | PromiseLike<User | null> | null {
    throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email },
    });
  }

  async findOneById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: id },
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
