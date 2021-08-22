import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ChallengesService {
  constructor(
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

}
