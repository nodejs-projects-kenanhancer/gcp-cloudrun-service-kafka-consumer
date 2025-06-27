import { Module } from '@nestjs/common';
import { HealthModule } from './health';

@Module({
  imports: [HealthModule],
  exports: [HealthModule],
})
export class HttpModule {}
