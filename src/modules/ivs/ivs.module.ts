import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OrmModule } from './../orm/orm.module';
import { IvsController } from './ivs.controller';
import { IvsService } from './ivs.service';
@Module({
  imports: [OrmModule, ConfigService],
  controllers: [IvsController],
  providers: [IvsService],
})
export class IvsModule {}
