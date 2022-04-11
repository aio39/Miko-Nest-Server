import { Module } from '@nestjs/common';
import { OrmModule } from 'modules/orm/orm.module';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

@Module({
  imports: [OrmModule],
  controllers: [TicketController],
  providers: [TicketService],
})
export class TicketModule {}
