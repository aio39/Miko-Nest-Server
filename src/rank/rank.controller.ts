import { Controller, Get, Param } from '@nestjs/common';
import { RankService } from './rank.service';

@Controller('')
export class RankController {
  constructor(private readonly rankService: RankService) {}

  @Get('/:id/getRank')
  getRank(@Param('id') concertId: number) {
    return this.rankService.getRank(concertId);
  }

  @Get('/:concertId/addPlayerToRank/:userId')
  addPlayerToRank(
    @Param('concertId') concertId: number,
    @Param('userId') userId: number,
  ) {
    // return this.rankService.addPlayerToRank(concertId, userId);
  }
}
