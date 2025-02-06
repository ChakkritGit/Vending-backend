import { Test, TestingModule } from '@nestjs/testing';
import { GroupInventoryService } from './group-inventory.service';

describe('GroupInventoryService', () => {
  let service: GroupInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupInventoryService],
    }).compile();

    service = module.get<GroupInventoryService>(GroupInventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
