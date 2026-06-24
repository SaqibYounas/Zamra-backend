import {
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { BottleType } from '@app-types/types';
import { Transform } from 'class-transformer';

export class CreatePriceManagementDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(BottleType, {
    message:
      'Bottle type must be a valid option (500ml, 1.5L, 19L_New, 19L_Refill)',
  })
  @IsNotEmpty({ message: 'Bottle type is required.' })
  bottleType!: BottleType;

  @IsNumber({}, { message: 'Per bottle price must be a number.' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: 'Per bottle price is required.' })
  perBottlePrice!: number;

  @IsNumber({}, { message: 'Label+Cap Price expenses must be a number.' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: 'Label+Cap Price expenses is required.' })
  labelCapPrice!: number;

  @IsNumber({}, { message: 'Other expenses must be a number.' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({ message: 'Other expenses is required.' })
  otherExpenses!: number;

  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;
}
