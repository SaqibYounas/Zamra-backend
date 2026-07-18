import { IsNotEmpty, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SellingPriceDto {
  @IsNumber({}, { message: 'Selling price must be a valid number.' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({
    message: 'Selling price is required.',
  })
  sellingPrice!: number;

  @IsNumber({}, { message: 'Price management id must be a valid number.' })
  @Transform(({ value }) => Number(value))
  @IsNotEmpty({
    message: 'Price management id is required.',
  })
  priceManagementId!: number;

  @IsBoolean({
    message: 'isActive must be a boolean value.',
  })
  @IsOptional()
  isActive?: boolean;
}
