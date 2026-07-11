import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Item code is required.' })
  itemCode!: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required.' })
  description!: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Quantity is required.' })
  qty!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Rate is required.' })
  rate!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Sort order is required.' })
  sortOrder!: number;
}

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty({ message: 'Invoice number is required.' })
  invoiceNo!: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Customer ID is required.' })
  customerId!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Shipping address ID is required.' })
  shippingAddressId!: number;

  @IsString()
  @IsNotEmpty({ message: 'PO number is required.' })
  poNo!: string;

  @IsString()
  @IsNotEmpty({ message: 'Ship via is required.' })
  shipVia!: string;

  @IsString()
  @IsNotEmpty({ message: 'Rep is required.' })
  rep!: string;

  @IsString()
  @IsNotEmpty({ message: 'FOB is required.' })
  fob!: string;

  @IsString()
  @IsNotEmpty({ message: 'Terms are required.' })
  terms!: string;

  @IsDateString()
  @IsNotEmpty({ message: 'Dispatch date is required.' })
  dispatchDate!: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Tax rate is required.' })
  taxRate!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Shipping charges are required.' })
  shippingCharges!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Misc charges are required.' })
  miscCharges!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Previous due arrears is required.' })
  previousDueArrears!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Amount paid is required.' })
  amountPaid!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Subtotal is required.' })
  subtotal!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Tax amount is required.' })
  taxAmount!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Total amount is required.' })
  totalAmount!: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty({ message: 'Balance due is required.' })
  balanceDue!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  @IsNotEmpty({ message: 'Invoice items are required.' })
  items!: CreateInvoiceItemDto[];
}
