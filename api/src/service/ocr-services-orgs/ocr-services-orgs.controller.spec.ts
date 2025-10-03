import { Test, TestingModule } from '@nestjs/testing';
import { OcrServicesOrgsController } from './ocr-services-orgs.controller';
import { OcrServicesOrgsService } from './ocr-services-orgs.service';

describe('OcrServicesOrgsController', () => {
  let controller: OcrServicesOrgsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OcrServicesOrgsController],
      providers: [OcrServicesOrgsService],
    }).compile();

    controller = module.get<OcrServicesOrgsController>(OcrServicesOrgsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
