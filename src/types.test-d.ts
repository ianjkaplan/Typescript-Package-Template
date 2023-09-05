/* eslint-disable @typescript-eslint/unbound-method */
import {
  assertType,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi,
} from "vitest";
import { z } from "zod";

import { EventPublisher } from "./publisher";
import { BrokerClient, PublishResult } from "./types";

const events = {
  checkin: z.object({
    id: z.string(),
    memberId: z.string(),
    checkinAt: z.string(),
  }),
  payment: z.object({
    id: z.string(),
    memberId: z.string(),
    amount: z.number(),
  }),
};

type MockZodEventSchema = typeof events;

describe("EventPublisher", () => {
  let publisher: EventPublisher<MockZodEventSchema>;
  beforeEach(() => {
    const broker: BrokerClient<MockZodEventSchema> = {
      send: vi.fn().mockResolvedValue(true),
      close: vi.fn(),
    };
    publisher = new EventPublisher({
      broker,
      events,
    });
  });

  describe("types", () => {
    test("first aguement accepts only event names", () => {
      expectTypeOf(publisher.publish)
        .parameter(0)
        .toEqualTypeOf<"checkin" | "payment">();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expectTypeOf(publisher.publish)
        .parameter(0)
        //@ts-expect-error foo is not a valid event name
        .toEqualTypeOf<"checkin" | "payment" | "foo">();
    });

    test("second argument accepts only event schemas based on the name passed as the first arguement", () => {
      assertType(
        publisher.publish("checkin", {
          id: "chkin_123",
          memberId: "mbr_123",
          checkinAt: "2021-01-01T00:00:00.000Z",
          //@ts-expect-error amount is not a valid property for checkin
          amount: 100,
        }),
      );
      assertType(
        publisher.publish("payment", {
          id: "inv_123",
          memberId: "mbr_123",
          //@ts-expect-error checkinAt is not a valid property for checkin
          checkinAt: "2021-01-01T00:00:00.000Z",
          amount: 100,
        }),
      );
    });
  });

  describe("safePublish", () => {
    test("returns a result", async () => {
      const result = await publisher.safePublish("checkin", {
        id: "chkin_123",
        memberId: "mbr_123",
        checkinAt: "2021-01-01T00:00:00.000Z",
      });
      assertType<PublishResult>(result);
    });

    test("returns a zod error if the message does not match the schema", async () => {
      const result = await publisher.safePublish("checkin", {
        //@ts-expect-error id should be a string
        id: 1,
        memberId: "mbr_123",
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        assertType<z.ZodError>(result.error);
      }
    });
  });
});
