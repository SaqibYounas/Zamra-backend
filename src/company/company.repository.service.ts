import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './company.entity';

@Injectable()
export class CompanyRepositoryService {
  constructor(
    @InjectRepository(Company)
    private readonly CompanyRepository: Repository<Company>,
  ) {}

  async createCompany(userData: Partial<Company>): Promise<Company> {
    return this.CompanyRepository.save(userData);
  }

  async findAll(): Promise<Company[]> {
    return this.CompanyRepository.find();
  }
}
