import { PartialType } from '@nestjs/mapped-types';
import { CreateIvDto } from './create-iv.dto';

export class UpdateIvDto extends PartialType(CreateIvDto) {}
