import { IsString, IsNotEmpty, Length } from 'class-validator';

export class AddReactionDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  emoji: string;
}
