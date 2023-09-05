# PushPress Events

This library manages application events and is responsible for:

- defining event schemas
- handling event validation
- publishing events to an event bus
- generating and exporting JSON schemas for events

## Usage

Install the package by running `npm install @pushpress/events`

import and instantiate an `EventPublisher` instance. Provide it with a `schema` and a `BrokerClient`.
The broker client is responsible for publishing events to an event broker. The schema provides the set of events
and their associated schemas.

When the publisher executes the `publish` method, the event is validated against the schema and then published to the
broker. The publisher type checks the event name against the schema so invalid event names and schemas will be caught
at compile time.

```typescript
import { EventPublisher } from "@pushpress/events";

const publisher = new EventPublisher();

await publisher.publish("calendar.class.checkin", {
  id: "123",
  name: "John Doe",
});
```

Consumer applications can import types from the schema to type check events. They can either import the typescript schema
that uses the [zod](https://github.com/colinhacks/zod) library or import the derived raw json schema as an input to a different validation strategy.

More types are available to use along with the `TSchema` type to ensure type safety when consuming events.

## Add an Event

To create a new add a new key to the `events` object in `src/schema.ts`. The key should be the event name and the value is a zod schema.
the event name must follow the pattern `service.domain.action`, for example `calendar.class.checkin`. The event name is used to generate the
topic that the event is published to. Not following this pattern will trigger errors at compile time and runtime.

```typescript
const events = {
  "calendar.class.checkin": z.object({
    id: z.string(),
    name: z.string(),
  }),
};
```
