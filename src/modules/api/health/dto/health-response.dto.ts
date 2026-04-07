import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ type: String, enum: ['ok', 'error'], description: 'Application status', example: 'ok' })
  status: 'ok' | 'error';

  @ApiProperty({ type: String, description: 'Timestamp', example: new Date().toISOString() })
  timestamp: string;
}
