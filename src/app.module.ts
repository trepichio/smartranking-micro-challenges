import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import config from 'src/config/database';

@Module({
  imports: [
    ConfigModule.forRoot({ expandVariables: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL, config),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
