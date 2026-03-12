export class ProductDeactivatedEvent {
  constructor(
    public readonly productId: number,
    public readonly title: string,
  ) {}
}
