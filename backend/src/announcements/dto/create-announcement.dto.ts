import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'Water supply maintenance' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Water service will be unavailable from 9:00 to 11:00.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string;
}
