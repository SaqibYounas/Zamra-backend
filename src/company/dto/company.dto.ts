import { IsString, IsEmail, IsNumber } from 'class-validator';

export class companyDto {
  @IsString()
  name!: string;

  @IsString()
  owner!: string;

  @IsString()
  address!: string;

  @IsString()
  city!: string;

  @IsNumber()
  contact!: number;

  @IsEmail()
  email!: string;
}
