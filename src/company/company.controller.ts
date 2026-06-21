import { Controller, UseGuards, Post } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('company')
export class CompanyController {}
