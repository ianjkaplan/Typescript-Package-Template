import fs from "fs";
import path from "path";
import { ZodType } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

async function generate(dirPath: string) {
  // clean up existing json files
  fs.readdirSync(path.join(__dirname, "../json")).forEach((file) => {
    fs.unlinkSync(path.join(__dirname, "../json", file));
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const module = (await import(dirPath)) as {
    default: Record<string, ZodType>;
  };

  Object.entries(module.default).forEach(([k, v]) => {
    const jsonSchema = zodToJsonSchema(v, { name: k, errorMessages: true });
    fs.writeFileSync(
      path.join(__dirname, `../json/${k}.json`),
      JSON.stringify(jsonSchema, null, 2),
    );
  });
}

generate("./schemas").catch((err) => console.error(err));
