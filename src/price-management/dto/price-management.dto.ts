import {
  IsEnum,
  IsNumber,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { BottleType } from '../../models/priceManagement/priceManagement.entity'; // Apne folder structure ke mutabiq path check kar lena

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

  @IsBoolean({ message: 'isActive must be a boolean value.' })
  @IsOptional()
  isActive?: boolean;
}
