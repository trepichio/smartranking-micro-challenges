import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Main');

  const {
    BROKER_USER,
    BROKER_PASSWORD,
    BROKER_IP,
    BROKER_PORT,
    BROKER_VIRTUAL_HOST,
  } = process.env;

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [
        `amqp://${BROKER_USER}:${BROKER_PASSWORD}@${BROKER_IP}:${BROKER_PORT}/${BROKER_VIRTUAL_HOST}`,
      ],
      queue: 'challenges-backend',
      noAck: true,
    },
  });

  /**
   * Overwrites toJSON method of Date Object in order to print it
   * in Brazilian format and timezone when it is serialized.
   * Every Date object will be affected with implementation.
   */
  Date.prototype.toJSON = function (): any {
    return this.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      formatMatcher: 'best fit',
    });
  };

  app.listen();
}
bootstrap();
