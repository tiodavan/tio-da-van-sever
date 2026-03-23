import { Module } from '@nestjs/common';
import { PresencesController } from './presences.controller';
import { PresencesService } from './presences.service';

@Module({
  controllers: [PresencesController],
  providers: [PresencesService],
})
export class PresencesModule {}
