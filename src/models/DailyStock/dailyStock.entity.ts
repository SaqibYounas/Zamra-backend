/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PriceManagement } from '../priceManagement/priceManagement.entity';

export enum BottleType {
  SMALL = '500ml',
  LARGE = '1.5L',
  GALLON = '19L',
  REFILL = '19L',
}

@Entity('daily_stock')
export class DailyStock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  totalPet!: number;

  @Column({
    type: 'enum',
    enum: BottleType,
    default: BottleType.SMALL,
  })
  bottleType!: BottleType;

  @ManyToOne(() => PriceManagement, (price) => price.stocks, { eager: true })
  @JoinColumn({ name: 'price_management_id' })
  priceManagement!: PriceManagement;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
