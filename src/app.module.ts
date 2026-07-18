import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './company/company.module';
import { PriceManagementModule } from './price-management/price-management.module';
import { DailyStockModule } from './daily-stock/daily-stock.module';
import { RagModule } from './chatbot/rag.module';
import { User } from './auth/user/users.entity';
import { BillingModule } from './billing/billing.module';
import { SellingPriceModule } from './selling-price/selling-price.module';
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
    CompanyModule,
    PriceManagementModule,
    DailyStockModule,
    RagModule,
    BillingModule,
    SellingPriceModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
