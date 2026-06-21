import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PriceManagement } from './PriceManagement.entity';
@Injectable()
export class PriceManagementService {
  constructor(
    @InjectRepository(PriceManagement)
    private readonly PriceManagRepository: Repository<PriceManagement>,
  ) {}

  async createCompany(
    userData: Partial<PriceManagement>,
  ): Promise<PriceManagement> {
    return this.PriceManagRepository.save(userData);
  }

  async findAll(): Promise<PriceManagement[]> {
    return this.PriceManagRepository.find();
  }
}
