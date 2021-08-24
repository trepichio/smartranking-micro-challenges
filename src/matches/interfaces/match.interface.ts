import { Document } from 'mongoose';

export interface IMatch extends Document {
  winner: string;
  result: Array<IResult>;
  players: Array<string>;
  category: string;
  challenge: string;
}

export interface IResult {
  set: string;
}
