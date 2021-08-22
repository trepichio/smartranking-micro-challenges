import { Document } from 'mongoose';
import { ChallengeStatus } from './challenge-status.enum';

export interface ChallengeInterface extends Document {
  dateTimeChallenge: Date;
  status: ChallengeStatus;
  dateTimeRequest: Date;
  dateTimeReply?: Date;
  requester: string;
  category: string;
  match?: string;
  players: string[];
}
