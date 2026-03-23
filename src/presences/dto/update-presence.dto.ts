import { IsBoolean } from 'class-validator';

export class UpdatePresenceDto {
  @IsBoolean()
  confirmed: boolean;
}
