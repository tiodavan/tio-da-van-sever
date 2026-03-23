import { IsString, IsUUID } from 'class-validator';

export class GuardianLinkRequestDto {
  @IsString()
  @IsUUID()
  guardianUserId: string;
}
