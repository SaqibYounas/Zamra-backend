import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { PriceManagement } from '../price-management/priceManagement.entity';

@Entity('selling_prices')
export class SellingRate {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('decimal')
  sellingPrice!: number;

  @ManyToOne(() => PriceManagement, (price) => price.sellingRates, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'priceManagementId',
  })
  priceManagement!: PriceManagement;

  @Column()
  priceManagementId!: number;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
