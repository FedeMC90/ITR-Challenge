export class OrderCancelledEvent {
  constructor(
    public readonly orderId: number,
    public readonly userId: number,
    public readonly items: Array<{
      productId: number;
      quantity: number;
    }>,
  ) {}
}
