import { OcrServiceSession} from '../schemas/ocr-services-sessions.schema';

export class OcrServicesSessionResponseDto {
  data: OcrServiceSession[];
  total_records: number;
  current_page: number;
  total_pages: number;
  next_page?: number | null;
  prev_page?: number | null;
}