import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

// [AUDIT]: I build the order entity with a simple structure, it can be extended in the future with more fields like shipping address, payment method, etc. I build it because it is a core part of the e-commerce application and it is needed to implement the order creation and retrieval functionalities.
@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'int' })
  public userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  public user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  public items: OrderItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  public totalAmount: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: OrderStatus.PENDING,
  })
  public status: OrderStatus;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
