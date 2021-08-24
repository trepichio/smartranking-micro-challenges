import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { ChallengesService } from './challenges.service';
import { ChallengeInterface } from './interfaces/challenge.interface';

const ackErrors: string[] = ['E1100', '_E404'];

@Controller('challenges')
export class ChallengesController {
  constructor(private readonly challengesService: ChallengesService) {}

  private readonly logger = new Logger(ChallengesController.name);

  @MessagePattern('get-challenges')
  async getChallenge(
    @Payload() payload: { challengeId: string; playerId: string },
    @Ctx() context: RmqContext,
  ): Promise<ChallengeInterface | ChallengeInterface[]> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const { playerId, challengeId } = payload;
      if (challengeId) {
        return await this.challengesService.getChallengeById(challengeId);
      }

      if (playerId) {
        return await this.challengesService.getChallengesByPlayerId(playerId);
      }

      return await this.challengesService.getChallenges();
    } finally {
      await channel.ack(originalMessage);
    }
  }

  @EventPattern('create-challenge')
  async createChallenge(
    @Payload() dto: ChallengeInterface,
    @Ctx() context: RmqContext,
  ): Promise<ChallengeInterface> {
    this.logger.log(`create Challenge: ${JSON.stringify(dto, null, 2)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      const challenge = await this.challengesService.createChallenge(dto);
      await channel.ack(originalMessage);
      return challenge;
    } catch (error) {
      this.logger.error(error.message);
      if (ackErrors.some((errorCode) => error.message.includes(errorCode))) {
        await channel.ack(originalMessage);
      }
    }
  }

  @EventPattern('update-challenge')
  async updateChallenge(
    @Payload()
    { challengeId, dto }: { challengeId: string; dto: ChallengeInterface },
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.logger.log(`update Challenge: ${JSON.stringify(challengeId)}`);
    this.logger.log(`with data:${JSON.stringify(dto, null, 2)}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.challengesService.updateChallenge(challengeId, dto);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((errorCode) => error.message.includes(errorCode))) {
        await channel.ack(originalMessage);
      }
    }
  }

  @EventPattern('delete-challenge')
  async deleteOne(
    @Payload() challengeId: string,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.logger.log(`delete Challenge: ${challengeId}`);

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.challengesService.deleteChallenge(challengeId);
      await channel.ack(originalMessage);
      this.logger.log('Deleted Challenge');
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((errorCode) => error.message.includes(errorCode))) {
        await channel.ack(originalMessage);
      }
    }
  }

  @EventPattern('add-match-to-challenge')
  async addMatchToChallenge(
    @Payload()
    { matchId, challenge }: { matchId: string; challenge: ChallengeInterface },
    @Ctx() context: RmqContext,
  ): Promise<void> {
    this.logger.log(
      `add Match ${matchId} to Challenge: ${JSON.stringify(challenge, null, 2)}`,
    );

    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      await this.challengesService.addMatchToChallenge(matchId, challenge);
      await channel.ack(originalMessage);
      this.logger.log('Added Match to Challenge');
    } catch (error) {
      this.logger.error(error.message);

      if (ackErrors.some((errorCode) => error.message.includes(errorCode))) {
        await channel.ack(originalMessage);
      }
    }
  }
}
