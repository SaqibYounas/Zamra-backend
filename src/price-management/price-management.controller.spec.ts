import { Test, TestingModule } from '@nestjs/testing';
import { PriceManagementController } from './price-management.controller';

describe('PriceManagementController', () => {
  let controller: PriceManagementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PriceManagementController],
    }).compile();

    controller = module.get<PriceManagementController>(PriceManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
