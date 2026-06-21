import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DailyStock } from '../DailyStock/dailyStock.entity';

@Entity('price_management')
export class PriceManagement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  bottleType!: string;

  @Column('decimal')
  perBottlePrice!: number;

  @Column('decimal')
  otherExpenses!: number;

  @OneToMany(() => DailyStock, (stock) => stock.priceManagement)
  stocks!: DailyStock[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
