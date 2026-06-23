import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './models/users/users.module';
import { User } from './models/users/users.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { PriceManagementModule } from './price-management/price-management.module';
import { DailyStockModule } from './daily-stock/daily-stock.module';
import { CompanyRepositoryModule } from './models/company/company.module';
import { DailyStockRepositoryModule } from './models/dailyStock/dailyStock.module';
import { PriceManagementRepositoryModule } from './models/priceManagement/priceManagement.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        entities: [User],
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    TypeOrmModule.forFeature([User]),
    AuthModule,
    UsersModule,
    CompanyModule,
    PriceManagementModule,
    DailyStockModule,
    CompanyRepositoryModule,
    DailyStockRepositoryModule,
    PriceManagementRepositoryModule
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
