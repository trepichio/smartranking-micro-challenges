import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { MatchInterface } from './interfaces/match.interface';
import { MatchesService } from './matches.service';

const ackErrors: string[] = ['E1100', '_E404'];

@Controller('matches')
export class MatchesController {
  private logger = new Logger(MatchesController.name);

  constructor(private readonly matchService: MatchesService) {}

  @EventPattern('create-match')
  async createMatch(
    @Payload() match: MatchInterface,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    const channel = context.getChannelRef();
    const originalMessage = context.getMessage();

    try {
      this.logger.log(`Creating match ${JSON.stringify(match)}`);
      await this.matchService.createMatch(match);
      await channel.ack(originalMessage);
    } catch (error) {
      this.logger.error(error.message);
      if (ackErrors.some((errorCode) => error.message.includes(errorCode))) {
        await channel.ack(originalMessage);
      }
    }
  }
}
