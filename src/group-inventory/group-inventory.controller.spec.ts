import { Test, TestingModule } from '@nestjs/testing';
import { GroupInventoryController } from './group-inventory.controller';
import { GroupInventoryService } from './group-inventory.service';

describe('GroupInventoryController', () => {
  let controller: GroupInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupInventoryController],
      providers: [GroupInventoryService],
    }).compile();

    controller = module.get<GroupInventoryController>(GroupInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
