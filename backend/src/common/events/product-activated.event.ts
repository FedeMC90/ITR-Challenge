export class ProductActivatedEvent {
  constructor(
    public readonly productId: number,
    public readonly title: string,
    public readonly merchantId: number,
    public readonly product: any,
  ) {}
}
