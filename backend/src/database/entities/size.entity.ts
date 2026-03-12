import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryColumn,
} from 'typeorm';

@Entity()
export class Size {
  @PrimaryColumn({ type: 'varchar', length: 30 })
  public code!: string;

  @CreateDateColumn({ type: 'timestamp' })
  public createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  public updatedAt!: Date;
}

export enum SizeCodes {
  NA = 'NA',
  // Letter sizes for clothing
  XS = 'XS',
  S = 'S',
  M = 'M',
  L = 'L',
  XL = 'XL',
  XXL = 'XXL',
  // Numeric sizes for jeans/pants
  W28 = '28',
  W30 = '30',
  W32 = '32',
  W34 = '34',
  W36 = '36',
  W38 = '38',
}
