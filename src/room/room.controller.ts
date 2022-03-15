import { Body, Controller, Get, Post } from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post('/enter-random')
  enterRandomRoom(@Body() { concertId }) {
    return this.roomService.enterRandomRoom(concertId);
  }

  @Get('/test-test')
  test() {
    return 'test';
  }
}
