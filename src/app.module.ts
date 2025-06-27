import { Module } from '@nestjs/common';
import { createAppConfig } from './app.config';
import { AppSettings, InfrastructureModule } from './infrastructure';
import { InterfacesModule } from './interfaces';

@Module({
  imports: [
    InfrastructureModule.forRoot<AppSettings>({
      config: {
        useConfig: createAppConfig(),
        // useConfig: createAppConfigLocal(),
        configType: AppSettings,
      },
      enableKafka: true,
    }),
    InterfacesModule,
  ],
})
export class AppModule {}
