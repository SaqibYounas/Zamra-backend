import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ShippingAddress } from './shipping.entity';
import { Invoice } from './invoice.entity';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'company_name', length: 255 })
  companyName!: string;

  @Column({ name: 'attention_poc', length: 255, nullable: false })
  attentionPoc!: string;

  @Column({ length: 50, nullable: true })
  phone!: string;

  @Column({ name: 'mailing_address', type: 'text', nullable: false })
  mailingAddress!: string;

  @Column({ length: 100, nullable: false })
  city!: string;

  @Column({ length: 255, nullable: false })
  email!: string;

  @OneToMany(
    () => ShippingAddress,
    (shipping: ShippingAddress) => shipping.customer,
  )
  shippingAddresses!: ShippingAddress[];

  @OneToMany(() => Invoice, (invoice: Invoice) => invoice.customer)
  invoices!: Invoice[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
