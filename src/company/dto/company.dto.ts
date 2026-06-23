import { IsString, IsEmail, IsNumber, IsNotEmpty } from 'class-validator';

export class companyDto {
  @IsString()
  @IsNotEmpty({ message: 'Company name is required.' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Owner name is required.' })
  owner!: string;

  @IsString()
  @IsNotEmpty({ message: 'Company address is required.' })
  address!: string;

  @IsString()
  @IsNotEmpty({ message: 'City name is required.' })
  city!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'Contact number is required.' })
  contact!: number;

  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty({ message: 'Email is required.' })
  email!: string;
}
