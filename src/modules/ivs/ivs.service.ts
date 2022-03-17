import {
  CreateChannelCommand,
  CreateChannelCommandInput,
  DeleteChannelCommand,
  DeleteChannelCommandInput,
  GetChannelCommand,
  GetChannelCommandInput,
  GetStreamCommand,
  GetStreamCommandInput,
  GetStreamKeyCommand,
  GetStreamKeyCommandInput,
  GetStreamSessionCommand,
  GetStreamSessionCommandInput,
  IvsClient,
  ListChannelsCommand,
  ListChannelsCommandInput,
  ListStreamKeysCommand,
  ListStreamKeysCommandInput,
  ListStreamsCommand,
  ListStreamsCommandInput,
  ListStreamSessionsCommand,
  ListStreamSessionsCommandInput,
  PutMetadataCommand,
  PutMetadataCommandInput,
  StopStreamCommand,
  StopStreamCommandInput,
  UpdateChannelCommand,
  UpdateChannelCommandInput,
} from '@aws-sdk/client-ivs';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Concerts } from 'entities/Concerts';
import * as fs from 'fs';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class IvsService {
  private client: IvsClient;
  private privateKey: Buffer;
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Concerts)
    private readonly concertsRepository: EntityRepository<Concerts>,
  ) {
    this.client = new IvsClient({
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS') as string,
        secretAccessKey: this.config.get('AWS_SECRET') as string,
      },
      region: this.config.get('AWS_REGION'),
    });
    this.privateKey = fs.readFileSync('private-key.pem');
  }

  async test() {
    return this.concertsRepository.findAll();
  }

  async getChannelList(input: ListChannelsCommandInput) {
    const command = new ListChannelsCommand({ maxResults: 10, ...input });
    try {
      const data = await this.client.send(command);
      return { success: data };
    } catch (error) {
      console.log(error);
      return { test: error };
    }
  }

  async createChannelCommand(
    input: CreateChannelCommandInput & { concertId: number },
  ) {
    const { concertId, ...commandInput } = input;
    const concert = await this.concertsRepository.findOneOrFail({
      id: concertId + '',
    });

    if (concert.channelArn) {
      throw new HttpException('already exists', HttpStatus.CONFLICT);
    }

    const command = new CreateChannelCommand({
      ...commandInput,
      name: concertId + '',
    });
    const { $metadata, channel, streamKey } = await this.client.send(command);

    if (channel && streamKey) {
      const { arn: channelArn, playbackUrl, ingestEndpoint } = channel;
      const { arn: streamKeyArn, value } = streamKey;
      concert.channelArn = channelArn as string;
      concert.playbackUrl = playbackUrl as string;
      concert.streamKeyArn = streamKeyArn as string;
      concert.streamKeyValue = value as string;
      concert.ingestEndpoint = ingestEndpoint as string;
      await this.concertsRepository.flush();

      return concert;
    }
  }

  async getChannelCommand(input: GetChannelCommandInput) {
    const command = new GetChannelCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }

  async updateChannel(input: UpdateChannelCommandInput) {
    const command = new UpdateChannelCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }

  async deleteChannelCommand(input: DeleteChannelCommandInput) {
    const command = new DeleteChannelCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }
  async listStreamKeysCommand(input: ListStreamKeysCommandInput) {
    const command = new ListStreamKeysCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }
  async getStreamKeyCommand(input: GetStreamKeyCommandInput) {
    const command = new GetStreamKeyCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }
  async stopStreamCommand(input: StopStreamCommandInput) {
    const command = new StopStreamCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }
  async getStreamCommand(input: GetStreamCommandInput) {
    const command = new GetStreamCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }
  async listStreamsCommand(input: ListStreamsCommandInput) {
    const command = new ListStreamsCommand({ ...input, maxResults: 10 });
    const response = await this.client.send(command);
    return { result: response };
  }
  async getStreamSessionCommand(input: GetStreamSessionCommandInput) {
    const command = new GetStreamSessionCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }

  async ListStreamSessionsCommand(input: ListStreamSessionsCommandInput) {
    const command = new ListStreamSessionsCommand(input);
    const response = await this.client.send(command);
    return { result: response };
  }
  async putMetadataCommand(input: PutMetadataCommandInput) {
    const { channelArn, metadata } = input;
    const command = new PutMetadataCommand({
      channelArn: channelArn,
      metadata: JSON.stringify(metadata),
    });
    const response = await this.client.send(command);
    return { result: response };
  }

  async auth(input) {
    const { arn } = input;
    const token = jwt.sign(
      {
        'aws:channel-arn': arn,
        'aws:access-control-allow-origin': '*',
        // exp: 1646808624,
      },
      this.privateKey,
      {
        algorithm: 'ES384',
        expiresIn: '12h',
      },
    );
    return { token };
  }
}
