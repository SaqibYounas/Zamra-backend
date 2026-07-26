import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { BottleType } from '@app-types/types';
import { Transform } from 'class-transformer';

export class CreateDailyStockDto {
  @IsEnum(BottleType, {
    message:
      'Bottle type must be a valid option (500ml, 1.5L, 19L_New, 19L_Refill)',
  })
  @IsNotEmpty({ message: 'Bottle type is required.' })
  bottleType!: BottleType;

  @IsNumber({}, { message: 'Total pet must be a numeric value.' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: 'Total pet count is required.' })
  totalPet!: number;

  @IsOptional()
  @IsNumber({}, { message: 'Bottles per pet must be a numeric value.' })
  @Transform(({ value }) => Number(value))
  bottlePerPet?: number;
}
