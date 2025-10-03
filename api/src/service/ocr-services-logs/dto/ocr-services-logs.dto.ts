import { OcrServiceLog } from '../schemas/ocr-services-logs.schema';

export class OcrServicesLogsResponseDto {
  data: OcrServiceLog[];
  total_records: number;
  current_page: number;
  total_pages: number;
  next_page?: number | null;
  prev_page?: number | null;
}