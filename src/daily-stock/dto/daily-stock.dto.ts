import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { BottleType } from 'src/types/types';

export class CreatePriceManagementDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  @IsEnum(BottleType, {
    message:
      'Bottle type must be a valid option (500ml, 1.5L, 19L_New, 19L_Refill)',
  })
  @IsNumber({}, { message: 'Total pet must be a number.' })
  @IsNotEmpty({ message: 'Total pet is required.' })
  totalPet!: BottleType;

  @IsNumber({}, { message: 'Per bottle price must be a number.' })
  @IsNotEmpty({ message: 'Bottle type is required.' })
  bbotlePerPet!: BottleType;
}
