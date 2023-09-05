import { z } from "zod";

import { TSchema as TDefaultSchema } from "./schemas";
import { BrokerClient, PublishResult, ZodEventSchema } from "./types";

type PublisherConfig<TSchema extends ZodEventSchema = TDefaultSchema> = {
  // the broker instance required to publishe events
  broker: BrokerClient<TSchema>;
  // defaults to the schemas defined in the library. optionally pass your own schemas to override the defaults.
  events: TSchema;
};

/**
 * EventPublisher is a class that provides a type safe interface for publishing events.
 * It is initialized with a broker instance expose a publish method that accepts an event name and a message.
 *
 *
 * @example
 * ```typescript
 * import { EventPublisher } from "@pushpress/events";
 * import { createRabbit } from "./rabbit";
 *
 * const run = async () => {
 *  const rabbit = await createRabbit({ url: "amqp://localhost" });
 *
 *  const p = new EventPublisher({
 *   broker: rabbit,
 *   events: loadEvents()
 *  });
 *
 *   await p.publish("checkin", { id: "123", name: "John Doe" });
 * };
 *
 * run().catch((err) => console.error(err));
 * ```
 *
 * Use the provided broker construction functions to create a broker instance. One should be provided for each broker implementation.
 */
class EventPublisher<TSchema extends ZodEventSchema = TDefaultSchema> {
  broker: BrokerClient<TSchema>;
  events: TSchema;
  constructor({ broker, events }: PublisherConfig<TSchema>) {
    this.events = events;
    this.broker = broker;
  }

  /**
   * Main method for publishing events to the broker.
   *
   * @template TTopic extends keyof Tschema -
   * @param event - topic name following the format of service.domain.event
   * @param message -  message to publish to the broker. Must match the schema defined for the event.
   *
   * @throws {ZodError} - throws a zod error if the message does not match the schema
   */
  async publish<TTopic extends keyof TSchema>(
    event: TTopic,
    message: z.infer<TSchema[TTopic]>,
  ) {
    const schema = this.events[event];
    const thing = schema.parse(message);
    await this.broker.send(event, thing);
  }

  /**
   * Alternative method to publish to the broker that returns a result object.
   * This method will not throw an error if the message does not match the schema.
   * Instead it will return a result object with a success property set to false and an error property containing the zod error.
   *
   * @example
   * ```typescript
   * import { EventPublisher } from "@pushpress/events";
   * import { createRabbit } from "./rabbit";
   * import { loadEvents } from "./schemas";
   *
   * const run = async () => {
   * const rabbit = await createRabbit({ url: "amqp://localhost" });
   * const p = new EventPublisher({
   *  broker: rabbit,
   *  events: loadEvents()
   *  });
   *  const result = await p.safePublish("calendar.class.checkin", { id: "123", name: "John Doe" });
   *  if (!result.success) {
   *   console.log(result.error);
   *  }
   *  console.log("published");
   * };
   *
   * run().catch((err) => console.error(err));
   * ```
   *
   * @see {@link EventPublisher#publish}
   */
  async safePublish<TTopic extends keyof TSchema>(
    event: TTopic,
    message: z.infer<TSchema[TTopic]>,
  ): Promise<PublishResult> {
    const schema = this.events[event];
    const msg = schema.safeParse(message);

    if (!msg.success) {
      return { success: false, error: msg.error };
    }
    await this.broker.send(event, msg.data);
    return { success: true };
  }
}

export { EventPublisher };
