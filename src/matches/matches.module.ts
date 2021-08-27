import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HelperFunctions } from 'src/common/helpers';
import { ProxyrmqModule } from 'src/proxyrmq/proxyrmq.module';
import { MatchSchema } from './interfaces/match.schema';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';

@Module({
  imports: [
    ProxyrmqModule,
    MongooseModule.forFeature([{ name: 'Match', schema: MatchSchema }]),
  ],
  controllers: [MatchesController],
  providers: [MatchesService, HelperFunctions],
})
export class MatchesModule {}
