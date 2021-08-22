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
}
