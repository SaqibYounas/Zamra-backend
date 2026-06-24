import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompanyRepositoryService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async createCompany(userData: Partial<Company>): Promise<Company> {
    return this.companyRepository.save(userData);
  }

  async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  async findOneLast(): Promise<Company | null> {
    return await this.companyRepository.findOne({
      where: {},
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
