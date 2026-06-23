import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { DailyStock } from '../dailyStock/dailyStock.entity';
import { BottleType } from 'src/types/types';

@Entity('price_management')
export class PriceManagement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: 'enum',
    enum: BottleType,
    default: BottleType.SMALL,
  })
  bottleType!: BottleType;

  @Column('decimal')
  perBottlePrice!: number;

  @Column('decimal')
  labelCapPrice!: number;

  @Column('decimal')
  otherExpenses!: number;

  @OneToMany(() => DailyStock, (stock) => stock.priceManagement)
  stocks!: DailyStock[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
