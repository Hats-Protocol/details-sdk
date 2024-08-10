import { PinataProvider } from "./providers";
import * as z from "zod";
import { DEDAULT_SCHEMA } from "./constants";
import type { ProviderType } from "./types";

export class HatsDetailsClient<T extends z.ZodTypeAny = typeof DEDAULT_SCHEMA> {
  private readonly pinataProvider: PinataProvider | undefined;
  private readonly provider: ProviderType;
  private readonly schema: T;

  constructor(config: {
    provider: ProviderType;
    schema?: T;
    pinata?: {
      key: string;
      gateway: string;
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
        throw new Error("Pinata config is required");
      }
      this.pinataProvider = new PinataProvider(
        config.pinata!.key,
        config.pinata!.gateway
      );
    } else {
      throw new Error("Invalid provider");
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
      throw new Error("Invalid provider");
    }
  }
}
