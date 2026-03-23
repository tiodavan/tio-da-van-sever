import { Module } from '@nestjs/common';
import { GuardianshipsService } from './guardianships.service';

@Module({
  providers: [GuardianshipsService],
  exports: [GuardianshipsService],
})
export class GuardianshipsModule {}
