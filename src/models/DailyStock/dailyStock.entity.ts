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
import { BottleType } from 'src/types/types';

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

  @Column('int')
  bottlePerPet!: number;

  @ManyToOne(() => PriceManagement, (price) => price.stocks, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'price_management_id' })
  priceManagement!: PriceManagement;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
