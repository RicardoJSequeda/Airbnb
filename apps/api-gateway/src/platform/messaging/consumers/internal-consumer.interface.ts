export interface InternalConsumer<TPayload = Record<string, unknown>> {
  consumerGroup: string;
  topic: string;
  handle(message: {
    eventId: string;
    topic: string;
    payload: TPayload;
    correlationId?: string;
    tenantId?: string;
    regionId?: string;
  }): Promise<void>;
}
