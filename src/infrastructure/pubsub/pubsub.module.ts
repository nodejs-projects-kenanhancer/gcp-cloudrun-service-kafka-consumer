import { Module } from '@nestjs/common';
import { ConfigModule } from '../config';
import { PubSubService } from './pubsub.service';

@Module({
  imports: [ConfigModule],
  providers: [PubSubService],
  exports: [PubSubService],
})
export class PubSubModule {}
