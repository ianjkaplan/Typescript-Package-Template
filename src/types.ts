import { AnyZodObject, z } from "zod";

import { TSchema } from "./schemas";

export type ExcludeInvalidKeys<Obj> = {
  [Key in keyof Obj]: Key extends `${string}.${string}.${string}`
    ? Obj[Key]
    : never;
};

// schema types
export type ZodEventSchema = Record<string, AnyZodObject>;

export type Topic = keyof ZodEventSchema;

export type RabbitTopicKey<T extends string> =
  T extends `${infer Service}.${infer Domain}.${infer Event}`
    ? `${Service | "*"}.${Domain | "*"}.${Event | "*"}`
    : never;

// publisher types
type PublishSuccess = { success: true };
type PublishFailure = { error: z.ZodError; success: false };
export type PublishResult = PublishSuccess | PublishFailure;

/**
 * The Broker interface is the main interface for publishing events to the broker.
 *
 * The send method is the main event publishing interface for all broker implementations.
 */
export interface BrokerClient<S extends ZodEventSchema = TSchema> {
  // clear a connection for graceful shutdown
  close(): Promise<void>;
  // main method for publishing events to the broker
  send<E extends keyof S>(
    event: E,
    message: z.infer<S[E]>,
  ): Promise<boolean> | boolean;
}
