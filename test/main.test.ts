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
  let hatsDetailsClientGateway: HatsDetailsClient;
  let hatsDetailsClientGatewayKey: HatsDetailsClient;

  beforeAll(async () => {
    hatsDetailsClientCustomSchema = new HatsDetailsClient({
      schema,
      provider: "pinata",
      pinata: {
        pinningKey: process.env.PINATA_JWT as string,
      },
    });
    hatsDetailsClientDefaultSchema = new HatsDetailsClient({
      provider: "pinata",
      pinata: {
        pinningKey: process.env.PINATA_JWT as string,
      },
    });
    hatsDetailsClientGateway = new HatsDetailsClient({
      provider: "pinata",
      pinata: {
        pinningKey: process.env.PINATA_JWT as string,
        gateway: process.env.PINATA_GATEWAY as string,
      },
    });
    hatsDetailsClientGatewayKey = new HatsDetailsClient({
      provider: "pinata",
      pinata: {
        pinningKey: process.env.PINATA_JWT as string,
        gateway: process.env.PINATA_GATEWAY_WITH_TOKEN as string,
        gatewayKey: process.env.PINATA_GATEWAY_TOKEN as string,
      },
    });
  });

  test("pin data scenario 1", async () => {
    const cid = await hatsDetailsClientCustomSchema.pin({
      name: "Hat",
      description: "This is a hat",
    });
    expect(cid).toBe("QmVvSUCcxbQcoTX6x5G9bCp7pjtTEnhT6dCBjTEJuCv5Ki");
  }, 15000);

  test("read data scenario 1 default gateway", async () => {
    const data = await hatsDetailsClientCustomSchema.get(
      "QmVvSUCcxbQcoTX6x5G9bCp7pjtTEnhT6dCBjTEJuCv5Ki"
    );
    expect(data).toStrictEqual({
      name: "Hat",
      description: "This is a hat",
    });
  }, 15000);

  test("pin data scenario 2", async () => {
    await expect(async () => {
      await hatsDetailsClientCustomSchema.pin({
        name: 3,
        description: "This is a hat",
      } as unknown as { name: string; description: string });
    }).rejects.toThrow(z.ZodError);
  }, 15000);

  test("pin data scenario 3", async () => {
    const cid = await hatsDetailsClientDefaultSchema.pin({
      type: "1.0",
      data: {
        name: "Hat",
        description: "This is a hat",
      },
    });
    expect(cid).toBe("QmcSopxmw5rMEEEU8NmGGQ2mbHJ293CGEiQ4r4w4jEECVy");
  }, 15000);

  test("read data scenario 3", async () => {
    const data = await hatsDetailsClientDefaultSchema.get(
      "QmcSopxmw5rMEEEU8NmGGQ2mbHJ293CGEiQ4r4w4jEECVy"
    );
    expect(data).toStrictEqual({
      type: "1.0",
      data: {
        name: "Hat",
        description: "This is a hat",
      },
    });
  }, 15000);

  test("pin data scenario 4", async () => {
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
  }, 15000);

  test("read data scenario 4", async () => {
    const data = await hatsDetailsClientDefaultSchema.get(
      "QmTTPqtdQHoaSPYaw7BAESEg4xM1HbebhiFWxKT26LWYnZ"
    );
    expect(data).toStrictEqual({
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
  }, 15000);

  test("read data scenario 4 dedicated gateway", async () => {
    const data = await hatsDetailsClientGateway.get(
      "QmTTPqtdQHoaSPYaw7BAESEg4xM1HbebhiFWxKT26LWYnZ"
    );
    expect(data).toStrictEqual({
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
  }, 15000);

  test("read data scenario 4 dedicated gateway with key", async () => {
    const data = await hatsDetailsClientGatewayKey.get(
      "QmTTPqtdQHoaSPYaw7BAESEg4xM1HbebhiFWxKT26LWYnZ"
    );
    expect(data).toStrictEqual({
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
  }, 15000);
});
