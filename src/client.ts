import { PinataProvider } from "./providers";
import * as z from "zod";
import { DEDAULT_SCHEMA } from "./constants";
import { PinataGetDataError } from "./errors";
import type { ProviderType } from "./types";

export class HatsDetailsClient<T extends z.ZodTypeAny = typeof DEDAULT_SCHEMA> {
  private readonly pinataProvider: PinataProvider | undefined;
  private readonly provider: ProviderType;
  private readonly schema: T;

  constructor(config: {
    provider: ProviderType;
    schema?: T;
    pinata?: {
      pinningKey: string;
      gateway?: string;
      gatewayKey?: string;
    };
  }) {
    if (config.schema === undefined) {
      this.schema = DEDAULT_SCHEMA as unknown as T;
    } else {
      this.schema = config.schema;
    }
    this.provider = config.provider;
    if (this.provider === "pinata") {
      if (!config.pinata) {
        throw new Error("Error: pinata config is required");
      }
      this.pinataProvider = new PinataProvider(
        config.pinata!.pinningKey,
        config.pinata!.gateway,
        config.pinata!.gatewayKey
      );
    } else {
      throw new Error("Error: invalid provider");
    }
  }

  async pin(data: z.infer<T>): Promise<string> {
    const isvalidRes = this.schema.safeParse(data);
    if (!isvalidRes.success) {
      throw isvalidRes.error;
    }

    if (this.provider === "pinata") {
      const cid = await this.pinataProvider!.pin(data);
      return cid;
    } else {
      throw new Error("Error: invalid provider");
    }
  }

  async get(cid: string): Promise<z.infer<T>> {
    if (this.provider === "pinata") {
      const data = await this.pinataProvider!.get(cid);
      const parsedData = this.schema.safeParse(data);
      if (!parsedData.success) {
        throw new PinataGetDataError(
          "Error: the fetched data does not match the schema"
        );
      }
      return parsedData.data;
    } else {
      throw new Error("Error: invalid provider");
    }
  }
}
