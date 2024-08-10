import { HatsDetailsClient } from "../src";
import * as z from "zod";
import "dotenv/config";

const schema = z.object({
  name: z.string(),
  description: z.string(),
});

describe("Test", () => {
  let hatsDetailsClientCustomSchema: HatsDetailsClient<typeof schema>;
  let hatsDetailsClientDefaultSchema: HatsDetailsClient;

  beforeAll(async () => {
    hatsDetailsClientCustomSchema = new HatsDetailsClient({
      schema,
      provider: "pinata",
      pinata: {
        key: process.env.PINATA_JWT as string,
        gateway: "https://gateway.pinata.cloud/ipfs/",
      },
    });
    hatsDetailsClientDefaultSchema = new HatsDetailsClient({
      provider: "pinata",
      pinata: {
        key: process.env.PINATA_JWT as string,
        gateway: "https://gateway.pinata.cloud/ipfs/",
      },
    });
  });

  test("pin data scenario 1", async () => {
    const cid = await hatsDetailsClientCustomSchema.pin({
      name: "Hat",
      description: "This is a hat",
    });
    expect(cid).toBe("QmVvSUCcxbQcoTX6x5G9bCp7pjtTEnhT6dCBjTEJuCv5Ki");
  });

  test("pin data scenario 2", async () => {
    await expect(async () => {
      await hatsDetailsClientCustomSchema.pin({
        name: 3,
        description: "This is a hat",
      } as unknown as { name: string; description: string });
    }).rejects.toThrow(z.ZodError);
  });

  test("pint data scenario 3", async () => {
    const cid = await hatsDetailsClientDefaultSchema.pin({
      type: "1.0",
      data: {
        name: "Hat",
        description: "This is a hat",
      },
    });
    expect(cid).toBe("QmcSopxmw5rMEEEU8NmGGQ2mbHJ293CGEiQ4r4w4jEECVy");
  });

  test("pint data scenario 4", async () => {
    const cid = await hatsDetailsClientDefaultSchema.pin({
      type: "1.0",
      data: {
        name: "Hat",
        description: "This is a hat",
        responsabilities: [
          {
            label: "responsability 1",
          },
        ],
      },
    });
    expect(cid).toBe("QmTTPqtdQHoaSPYaw7BAESEg4xM1HbebhiFWxKT26LWYnZ");
  });
});
