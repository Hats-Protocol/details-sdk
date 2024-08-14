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

  async get(cid: string): Promise<{
    parsedData: z.infer<T> | null;
    rawData: unknown | null;
    error: { message: string } | null;
  }> {
    if (this.provider === "pinata") {
      const res = await this.pinataProvider!.get(cid);
      if (res.error) {
        return {
          parsedData: null,
          rawData: null,
          error: { message: res.error.message },
        };
      }

      const parsedData = this.schema.safeParse(res.data);
      if (!parsedData.success) {
        return {
          parsedData: null,
          rawData: res.data,
          error: null,
        };
      }
      return {
        parsedData: parsedData.data,
        rawData: null,
        error: null,
      };
    } else {
      throw new Error("Error: invalid provider");
    }
  }
}
