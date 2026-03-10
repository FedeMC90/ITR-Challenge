import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column({ type: 'int' })
  public orderId: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'orderId' })
  public order: Order;

  @Column({ type: 'int' })
  public productId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  public product: Product;

  @Column({ type: 'int' })
  public quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  public price: number;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}
