/* eslint-disable @typescript-eslint/unbound-method */
import { assertType, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

import { EventPublisher } from "./publisher";
import { BrokerClient } from "./types";

const events = {
  ["calendar.class.checkin"]: z.object({
    id: z.string(),
    memberId: z.string(),
    checkinAt: z.string(),
  }),
  ["billing.invoice.payment"]: z.object({
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

  describe("publish", () => {
    test("returns a zod error if the message does not match the schema", async () => {
      const result = await publisher.safePublish("calendar.class.checkin", {
        //@ts-expect-error id should be a string
        id: 1,
        memberId: "mbr_123",
      });
      expect(result.success).toBe(false);
    });
    test("returns a success response after validating schema", async () => {
      const result = await publisher.safePublish("calendar.class.checkin", {
        id: "chkin_123",
        memberId: "mbr_123",
        checkinAt: "2021-01-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });
  });
  describe("safePublish", () => {
    test("returns a zod error if the message does not match the schema", async () => {
      const result = await publisher.safePublish("calendar.class.checkin", {
        //@ts-expect-error id should be a string
        id: 1,
        memberId: "mbr_123",
      });
      expect(result.success).toBe(false);

      if (!result.success) {
        assertType<z.ZodError>(result.error);
      }
    });
    test("returns a success response after validating schema", async () => {
      const result = await publisher.safePublish("calendar.class.checkin", {
        id: "chkin_123",
        memberId: "mbr_123",
        checkinAt: "2021-01-01T00:00:00.000Z",
      });
      expect(result.success).toBe(true);
    });
  });
});
