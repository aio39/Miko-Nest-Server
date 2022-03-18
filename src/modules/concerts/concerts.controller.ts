import { Controller, Get, Param } from '@nestjs/common';
import { ConcertsService } from './concerts.service';

@Controller('concerts')
export class ConcertsController {
  constructor(private readonly concertsService: ConcertsService) {}

  @Get('/quiz/:id')
  update(@Param('id') id: number) {
    return this.concertsService.getQuizResult(+id);
  }
}
