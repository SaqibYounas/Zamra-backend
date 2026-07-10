import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { ShippingAddress } from './shipping.entity';
import { InvoiceItem } from './invoice-item.entity';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'invoice_no', unique: true, length: 50 })
  invoiceNo!: string;

  @ManyToOne(() => Customer, (customer) => customer.invoices)
  @JoinColumn({ name: 'customer_id' })
  customer!: Customer;

  @ManyToOne(() => ShippingAddress, (shipping) => shipping.invoices, {
    nullable: true,
  })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress!: ShippingAddress;

  @Column({ name: 'po_no', length: 100, nullable: false })
  poNo!: string;

  @Column({ name: 'ship_via', length: 100, nullable: false })
  shipVia!: string;

  @Column({ length: 100, nullable: false })
  rep!: string;

  @Column({ length: 100, nullable: false })
  fob!: string;

  @Column({ length: 100, nullable: false })
  terms!: string;

  @Column({ name: 'dispatch_date', type: 'date', nullable: false })
  dispatchDate!: Date;

  @Column({
    name: 'tax_rate',
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
  })
  taxRate!: number;

  @Column({
    name: 'shipping_charges',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingCharges!: number;

  @Column({
    name: 'misc_charges',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  miscCharges!: number;

  @Column({
    name: 'previous_due_arrears',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  previousDueArrears!: number;

  @Column({
    name: 'amount_paid',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  amountPaid!: number;

  @Column({
    name: 'subtotal',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  subtotal!: number;

  @Column({
    name: 'tax_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount!: number;

  @Column({
    name: 'total_amount',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmount!: number;

  @Column({
    name: 'balance_due',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
  })
  balanceDue!: number;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
  })
  items!: InvoiceItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
