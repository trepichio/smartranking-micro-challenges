import { Module } from '@nestjs/common';
import { ClientProxySmartRanking } from './client-proxy.provider';

@Module({
  providers: [ClientProxySmartRanking],
  exports: [ClientProxySmartRanking],
})
export class ProxyrmqModule {}
