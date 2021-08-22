import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxyrmqModule } from './proxyrmq/proxyrmq.module';
import { ChallengesModule } from './challenges/challenges.module';
import { MatchesModule } from './matches/matches.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config from 'src/config/database';

@Module({
  imports: [
    ConfigModule.forRoot({ expandVariables: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL, config),
    ProxyrmqModule,
    ChallengesModule,
    MatchesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
