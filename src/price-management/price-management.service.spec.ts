import { Test, TestingModule } from '@nestjs/testing';
import { PriceManagementService } from './price-management.service';

describe('PriceManagementService', () => {
  let service: PriceManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PriceManagementService],
    }).compile();

    service = module.get<PriceManagementService>(PriceManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
