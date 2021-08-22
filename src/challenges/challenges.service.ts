import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChallengeInterface } from './interfaces/challenge.interface';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge')
    private readonly challengeModel: Model<ChallengeInterface>,

  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  async getChallenges(): Promise<ChallengeInterface[]> {
    try {
      return await this.challengeModel.find().exec();
    } catch (err) {
      this.logger.error(
        `Error getting challenges: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }
}
