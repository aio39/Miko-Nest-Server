import {
  CreateChannelCommandInput,
  DeleteChannelCommandInput,
  GetChannelCommandInput,
  GetStreamCommandInput,
  GetStreamKeyCommandInput,
  GetStreamSessionCommandInput,
  ListChannelsCommandInput,
  ListStreamKeysCommandInput,
  ListStreamsCommandInput,
  ListStreamSessionsCommandInput,
  PutMetadataCommandInput,
  StopStreamCommandInput,
  UpdateChannelCommandInput,
} from '@aws-sdk/client-ivs';
import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { IvsService } from './ivs.service';
@Controller('ivs')
export class IvsController {
  constructor(private readonly ivsService: IvsService) {}

  @Get('/')
  getChannelList(@Body() input: ListChannelsCommandInput) {
    return this.ivsService.getChannelList(input);
  }

  @Post('/')
  createChannelCommand(
    @Body() input: CreateChannelCommandInput & { ticketId: number },
  ) {
    return this.ivsService.createChannelCommand(input);
  }
  @Get('/one')
  getChannelCommand(@Body() input: GetChannelCommandInput) {
    return this.ivsService.getChannelCommand(input);
  }

  @Patch('one')
  updateChannel(@Body() input: UpdateChannelCommandInput) {
    return this.ivsService.updateChannel(input);
  }

  @Delete('/one')
  deleteChannelCommand(@Body() input: DeleteChannelCommandInput) {
    return this.ivsService.deleteChannelCommand(input);
  }

  @Get('/streamkeys')
  listStreamKeysCommand(@Body() input: ListStreamKeysCommandInput) {
    return this.ivsService.listStreamKeysCommand(input);
  }

  @Get('/streamkey')
  getStreamKeyCommand(@Body() input: GetStreamKeyCommandInput) {
    return this.ivsService.getStreamKeyCommand(input);
  }

  @Delete('/streamkey')
  stopStreamCommand(@Body() input: StopStreamCommandInput) {
    return this.ivsService.stopStreamCommand(input);
  }

  @Get('/stream')
  getStreamCommand(@Body() input: GetStreamCommandInput) {
    return this.ivsService.getStreamCommand(input);
  }

  @Get('/streams')
  listStreamsCommand(@Body() input: ListStreamsCommandInput) {
    return this.ivsService.listStreamsCommand(input);
  }

  @Get('/session')
  getStreamSessionCommand(@Body() input: GetStreamSessionCommandInput) {
    return this.ivsService.getStreamSessionCommand(input);
  }

  @Get('/sessions')
  ListStreamSessionsCommand(@Body() input: ListStreamSessionsCommandInput) {
    return this.ivsService.ListStreamSessionsCommand(input);
  }

  @Post('/metadata')
  putMetadataCommand(@Body() input: PutMetadataCommandInput) {
    return this.ivsService.putMetadataCommand(input);
  }

  @Delete('/:ivsId')
  deleteIvs() {
    return null;
  }

  @Post('/get-jwt')
  auth(@Body() input: { arn: string }) {
    return this.ivsService.auth(input);
  }
}
