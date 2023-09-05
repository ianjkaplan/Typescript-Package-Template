/**
 * @module consumer for dev iteration and sanity testing
 */
import { connect, Connection } from "amqplib";

import { TSchema } from "./schemas";
import { RabbitTopicKey } from "./types";

const run = async () => {
  const connection = await connect("amqp://localhost");

  return consumeTopic(connection, "calendar.class.checkin");
};

async function consumeTopic(
  connection: Connection,
  key: RabbitTopicKey<keyof TSchema>,
) {
  const channel = await connection.createChannel();
  const exchange = await channel.assertExchange("events", "topic", {
    durable: true,
  });
  const q = await channel.assertQueue("", { durable: true });
  await channel.bindQueue(q.queue, exchange.exchange, key);
  return channel.consume(q.queue, (msg) =>
    console.log("received", msg?.content.toString()),
  );
}

run().catch((err) => console.error(err));
