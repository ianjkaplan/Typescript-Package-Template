import { EventPublisher } from "./publisher";
import { createRabbitClient } from "./rabbit";
import { loadEvents } from "./schemas";

const doSomething = () => {
  console.log("something");
};

const doSomethingElse = () => {
  console.log("something else");
};

const pub = async () => {
  const rabbit = await createRabbitClient({
    url: "amqp://localhost",
    exchange: "events",
  });

  const p = new EventPublisher({
    broker: rabbit,
    events: loadEvents(),
  });

  // await p.publish("invalid", { id: "123" });
  await p.publish("calendar.class.checkin", {
    id: "123",
    name: "John Doe",
  });
};

const run = async () => {
  doSomething();
  await pub();
  doSomethingElse();
};

run().catch((err) => console.error(err));
