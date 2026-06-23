import {
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { BottleType } from 'src/types/types';

export class CreatePriceManagementDto {
  @IsEnum(BottleType, {
    message:
      'Bottle type must be a valid option (500ml, 1.5L, 19L_New, 19L_Refill)',
  })
  @IsNotEmpty({ message: 'Bottle type is required.' })
  bottleType!: BottleType;

  @IsNumber({}, { message: 'Per bottle price must be a number.' })
  @IsNotEmpty({ message: 'Per bottle price is required.' })
  perBottlePrice!: number;

  @IsNumber({}, { message: 'Other expenses must be a number.' })
  @IsNotEmpty({ message: 'Other expenses is required.' })
  otherExpenses!: number;

  @IsNumber({}, { message: 'Label+Cap Price expenses must be a number.' })
  @IsNotEmpty({ message: 'Label+Cap Price expenses is required.' })
  labelCapPrice!: number;

  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;
}
