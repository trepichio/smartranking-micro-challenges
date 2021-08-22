import { Document } from 'mongoose';

export interface MatchInterface extends Document {
  winner: string;
  result: Array<ResultInterface>;
  players: Array<string>;
  category: string;
  challenge: string;
}

export interface ResultInterface {
  set: string;
}
