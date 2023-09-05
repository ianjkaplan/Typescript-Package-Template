/**
 * @module This file defines all schemas for durable events.
 *
 * All event schemas are defined on a base schema object for easy access.
 *
 * A key on the base schema object is the name of the event topic.
 * The value of the key is the schema for the event specied by a zod schema.
 * zod schemas allow for unified type checking and runtime validation.
 * larger schemas can be composed of smaller ones.
 *
 * Use error messages to provide context event publisher users
 *
 * Use describe functions to provide additional information on the generated JSON schema
 */
import { z } from "zod";

import { ExcludeInvalidKeys } from "./types";

// define all event schemas here
const schema = {
  ["calendar.class.checkin"]: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .describe("checkins event schema"),
  ["calendar.class.registration"]: z
    .object({
      id: z.string(),
      createdAt: z.string(),
    })
    .describe("registration event schema"),
} as const;

export default schema;
export type TSchema = ExcludeInvalidKeys<typeof schema>;

function filterInvalidKeys<T extends Record<string, unknown>>(
  obj: T,
): ExcludeInvalidKeys<T> {
  const regex = /^[^.]+[.][^.]+[.][^.]+$/;
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => regex.test(key)),
  ) as ExcludeInvalidKeys<T>;
}

export function loadEvents() {
  return filterInvalidKeys(schema);
}
