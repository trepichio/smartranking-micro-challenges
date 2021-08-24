import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMatch } from 'src/matches/interfaces/match.interface';
import { ChallengeStatus } from './interfaces/challenge-status.enum';
import { IChallenge } from './interfaces/challenge.interface';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel('Challenge')
    private readonly challengeModel: Model<IChallenge>,
    @InjectModel('Match')
    private readonly matchModel: Model<IMatch>,
  ) {}

  private readonly logger = new Logger(ChallengesService.name);

  async getChallenges(): Promise<IChallenge[]> {
    try {
      return await this.challengeModel.find().exec();
    } catch (err) {
      this.logger.error(
        `Error getting challenges: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }

  async getChallengesByPlayerId(playerId: string): Promise<IChallenge[]> {
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

  async getChallengeById(challengeId: string): Promise<IChallenge> {
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

  async createChallenge(dto: IChallenge): Promise<IChallenge> {
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

  async updateChallenge(challengeId: string, dto: IChallenge): Promise<void> {
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
    data: IChallenge | { status: ChallengeStatus },
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

  async addMatchToChallenge(
    matchId: string,
    challenge: IChallenge,
  ): Promise<void> {
    try {
      /**
       * set Challenge's status as concluded and associate the match
       */
      challenge.status = ChallengeStatus.FINISHED;
      challenge.match = matchId;

      /**
       * and then update the challenge in the database
       */
      await this.updateChallenge(challenge._id, challenge).catch(
        async (error) => {
          this.logger.error(error);
          /**
           * If for any reason the update of challenge fails
           * it is needed to delete the match
           */
          await this.matchModel.deleteOne({ _id: matchId }).exec();
          throw new InternalServerErrorException();
        },
      );
    } catch (err) {
      this.logger.error(
        `Error adding match to challenge: ${JSON.stringify(err.message)}`,
      );
      throw new RpcException(err.message);
    }
  }
}
