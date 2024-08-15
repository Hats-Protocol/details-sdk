import { PinataProvider } from "./providers";
import * as z from "zod";
import { DEDAULT_SCHEMA } from "./constants";
import type { ProviderType } from "./types";

export class HatsDetailsClient<T extends z.ZodTypeAny = typeof DEDAULT_SCHEMA> {
  private readonly pinataProvider: PinataProvider | undefined;
  private readonly provider: ProviderType;
  private readonly schema: T;

  /**
   * Initialize a HatsDetailsClient.
   *
   * @param provider - Type of IPFS provider to use, currently on "pinata" is supported.
   * @param schema - Optional Zod schema to validate the data. If not provided, a default schema will be used.
   * @param pinata - An object containing the pinata pinning key, optional gateway url and gateway optional key.
   * @returns A HatsDetailsClient instance.
   * For more information, check out the docs: https://docs.hatsprotocol.xyz/for-developers/v1-sdk/hat-details/getting-started#hatsdetailsclient-initialization
   */
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

  /**
   * Pin data to IPFS.
   *
   * @param data - Data to pin to IPFS. The data will be validated against the schema provided in the constructor.
   * @returns A promise that resolves to the CID of the pinned data.
   * For more information, check out the docs: https://docs.hatsprotocol.xyz/for-developers/v1-sdk/hat-details/usage#store
   */
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

  /**
   * Get data from IPFS.
   *
   * @param cid - CID of the data to retrieve.
   * @returns A promise that resolves to an object containing the parsed data if the data is compatible to the schema.
   * If the data is not compatible with the schema, then it will be returned in the raw data field.
   * If an error occured, then the error field will contain the error message.
   * For more information, check out the docs: https://docs.hatsprotocol.xyz/for-developers/v1-sdk/hat-details/usage#read
   */
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
