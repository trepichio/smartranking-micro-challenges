import { Controller, Logger } from '@nestjs/common';
import { MatchesService } from './matches.service';

const ackErrors: string[] = ['E1100', '_E404'];

@Controller('matches')
export class MatchesController {
  private logger = new Logger(MatchesController.name);

  constructor(private readonly matchService: MatchesService) {}

}
