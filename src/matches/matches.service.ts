import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChallengeInterface } from 'src/challenges/interfaces/challenge.interface';
import { ClientProxySmartRanking } from 'src/proxyrmq/client-proxy.provider';
import { MatchInterface } from './interfaces/match.interface';

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel('Match') private matchModel: Model<MatchInterface>,
    private clientProxySmartRanking: ClientProxySmartRanking,
  ) {}

  private readonly logger = new Logger(MatchesService.name);

  private readonly clientChallenges =
    this.clientProxySmartRanking.getClientProxyInstance('challenges');

  async createMatch(match: MatchInterface): Promise<MatchInterface> {
    try {
      /**
       * Create a match
       */
      const newMatch = new this.matchModel(match);

      /**
       * save match in the database
       */
      const matchSaved = await newMatch.save();
      this.logger.log(`Created match ${JSON.stringify(matchSaved._id)}`);

      const matchId = matchSaved._id;

      /**
       * get the challenge of the match
       */
      const challenge: ChallengeInterface = await this.clientChallenges
        .send('get-challenges', { challengeId: match.challenge })
        .toPromise();

      this.logger.log(`challenge:${JSON.stringify(challenge, null, 2)}`);

      /**
       * we call the 'add-match-to-challenge' topic to update the challenge
       */
      return await this.clientChallenges
        .emit('add-match-to-challenge', { matchId, challenge })
        .toPromise();
    } catch (error) {
      this.logger.error(`${JSON.stringify(error.message)}`);
      throw new RpcException(error.message);
    }
  }
}
