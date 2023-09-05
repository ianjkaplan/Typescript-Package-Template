import { connect } from "amqplib";

import { BrokerClient } from "./types";

type RabbitConfig = {
  exchange: string;
  url: string;
};

export async function createRabbitClient({
  url,
  exchange,
}: RabbitConfig): Promise<BrokerClient> {
  const connection = await connect(url);
  const channel = await connection.createChannel();
  await channel.assertExchange(exchange, "topic", { durable: true });

  return {
    send: (event: string, message: object) =>
      channel.publish(exchange, event, Buffer.from(JSON.stringify(message))),
    close: async () => {
      await channel.close();
      return connection.close();
    },
  };
}
