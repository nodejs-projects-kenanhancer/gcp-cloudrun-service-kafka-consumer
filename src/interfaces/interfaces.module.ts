import { Module } from '@nestjs/common';
import { CliModule } from './cli';
import { HttpModule } from './http/http.module';

@Module({
  imports: [HttpModule, CliModule],
  exports: [HttpModule, CliModule],
})
export class InterfacesModule {}
