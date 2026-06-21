import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { PriceManagement } from '../PriceManagement/PriceManagement.entity';

@Entity('daily_stock')
export class DailyStock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int')
  totalPet!: number;

  @Column('int')
  bottlePerPet!: number;

  @ManyToOne(() => PriceManagement, (price) => price.stocks, { eager: true })
  @JoinColumn({ name: 'price_management_id' })
  priceManagement!: PriceManagement;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
