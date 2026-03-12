import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Currency {
  @PrimaryColumn({ type: 'varchar', length: 7 })
  public code!: string;

  @Column({ type: 'varchar' })
  public name: string;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}

export enum CurrencyCodes {
  USD = 'USD',
  EUR = 'EUR',
  ARS = 'ARS',
  EGP = 'EGP',
}

export enum CurrencyNames {
  USD = 'US Dollar',
  EUR = 'Euro',
  ARS = 'Argentine Peso',
  EGP = 'Egyptian Pound',
}
