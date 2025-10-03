import { Test, TestingModule } from '@nestjs/testing';
import { OcrServicesOrgsService } from './ocr-services-orgs.service';

describe('OcrServicesOrgsService', () => {
  let service: OcrServicesOrgsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OcrServicesOrgsService],
    }).compile();

    service = module.get<OcrServicesOrgsService>(OcrServicesOrgsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
