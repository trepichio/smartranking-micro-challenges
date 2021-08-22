import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
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

  async getChallengesByPlayerId(
    playerId: string,
  ): Promise<ChallengeInterface[]> {
    try {
      return await this.challengeModel
        .find({ players: { $all: [playerId] } })
        .exec();
    } catch (err) {
      this.logger.error(
        `Error getting challenges: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }

  async getChallengeById(challengeId: string): Promise<ChallengeInterface> {
    try {
      const challengeFound = await this.challengeModel
        .findById(challengeId)
        .exec();

      if (!challengeFound) {
        throw new NotFoundException(
          `This challenge ${challengeId} cannot be found.`,
        );
      }

      return challengeFound;
    } catch (err) {
      this.logger.error(
        `Error getting challenge: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }

  async createChallenge(dto: ChallengeInterface): Promise<ChallengeInterface> {
    try {
      const newChallenge = new this.challengeModel(dto);
      dto.dateTimeRequest = new Date();

      /**
       * Set Current Request time and PENDING status
       */
      newChallenge.status = ChallengeStatus.PENDING;
      newChallenge.dateTimeRequest = new Date();

      return await newChallenge.save();
    } catch (err) {
      this.logger.error(
        `Error creating challenge: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }

  async updateChallenge(
    challengeId: string,
    dto: ChallengeInterface,
  ): Promise<void> {
    try {
      const challengeFound = await this.getChallengeById(challengeId);

      /**
       * add Date and Time for Response when updating status
       */
      if (dto.status) {
        challengeFound.dateTimeReply = new Date();
      }

      Object.assign(challengeFound, dto);

      return await this.update(challengeFound.id, challengeFound);
    } catch (err) {
      this.logger.error(
        `Error updating challenge: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }

  private async update(
    id: string,
    data: ChallengeInterface | { status: ChallengeStatus },
  ): Promise<void> {
    this.logger.log(`data to update: ${JSON.stringify(data, null, 2)}`);
    await this.challengeModel.findByIdAndUpdate(id, { $set: data }).exec();
  }

  async deleteChallenge(challengeId: string) {
    try {
      const challengeFound = await this.getChallengeById(challengeId);

      await this.delete(challengeFound.id);
    } catch (err) {
      this.logger.error(
        `Error deleting challenge: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }

  private async delete(id: string): Promise<void> {
    await this.update(id, { status: ChallengeStatus.CANCELLED });
  }
}
