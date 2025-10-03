import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponse {
  @ApiProperty({
    description: 'HTTP status code',
    example: 400
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error message or array of error messages',
    oneOf: [
      { type: 'string', example: 'Validation failed' },
      { type: 'array', items: { type: 'string' }, example: ['name should not be empty', 'age must be a number'] }
    ]
  })
  message: string | string[];

  @ApiProperty({
    description: 'Error type',
    example: 'Bad Request'
  })
  error: string;

  @ApiProperty({
    description: 'Timestamp of the error',
    example: '2025-06-20T10:30:00.000Z'
  })
  timestamp: string;

  @ApiProperty({
    description: 'API path where the error occurred',
    example: '/api/cats'
  })
  path: string;
}

export class ApiSuccessResponse {
  @ApiProperty({
    description: 'Success message',
    example: 'Operation completed successfully'
  })
  message: string;

  @ApiProperty({
    description: 'Response data'
  })
  data?: any;

  @ApiProperty({
    description: 'Timestamp of the response',
    example: '2025-06-20T10:30:00.000Z'
  })
  timestamp: string;
}
