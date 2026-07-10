import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Invoice } from './invoice.entity';

@Entity('shipping_addresses')
export class ShippingAddress {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Customer, (customer) => customer.shippingAddresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @Column({ name: 'warehouse_name', length: 255, nullable: false })
  warehouseName!: string;

  @Column({ name: 'attention_to', length: 255, nullable: false })
  attentionTo!: string;

  @Column({ length: 50, nullable: false })
  phone!: string;

  @Column({ name: 'delivery_address', type: 'text', nullable: false })
  deliveryAddress!: string;

  @OneToMany(() => Invoice, (invoice) => invoice.shippingAddress)
  invoices!: Invoice[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
