import { Module } from '@nestjs/common';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';
import { GuardianshipsModule } from '../guardianships/guardianships.module';

@Module({
  imports: [GuardianshipsModule],
  controllers: [StudentsController],
  providers: [StudentsService],
})
export class StudentsModule {}
