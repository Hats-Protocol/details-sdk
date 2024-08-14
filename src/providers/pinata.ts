import axios from "axios";
import urlJoin from "url-join";
import { PinataPinningError } from "../errors";

export class PinataProvider {
  private readonly pinningKey: string;
  private readonly gateway: string | undefined;
  private readonly gatewayKey: string | undefined;

  constructor(pinningKey: string, gateway?: string, gatewayKey?: string) {
    this.pinningKey = pinningKey;
    this.gateway = gateway;
    this.gatewayKey = gatewayKey;
  }

  async pin(data: unknown): Promise<string> {
    try {
      const preparedData = JSON.stringify({
        pinataContent: data,
      });
      const res = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        preparedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.pinningKey}`,
          },
        }
      );
      if (res.status !== 200) {
        throw new PinataPinningError(
          `Error: failed to pin data, error code: ${res.status}`
        );
      }
      return res.data.IpfsHash;
    } catch (error) {
      throw new PinataPinningError(
        `Error: unexpected error when trying to pin data, error message: ${error}`
      );
    }
  }

  async get(
    cid: string
  ): Promise<{ data: unknown | null; error: { message: string } | null }> {
    try {
      if (this.gateway === undefined) {
        const res = await axios.get(`https://ipfs.io/ipfs/${cid}`, {
          responseType: "json",
        });
        const contentType = res.headers["content-type"];
        if (contentType.includes("application/json")) {
          return { data: res.data, error: null };
        } else {
          return {
            data: null,
            error: {
              message: `Error: expecting a JSON object, but received data of type ${contentType}`,
            },
          };
        }
      } else if (this.gatewayKey === undefined) {
        const url = urlJoin(this.gateway, "ipfs", cid);
        const res = await axios.get(`${url}`);
        const contentType = res.headers["content-type"];
        if (contentType.includes("application/json")) {
          return { data: res.data, error: null };
        } else {
          return {
            data: null,
            error: {
              message: `Error: expecting a JSON object, but received data of type ${contentType}`,
            },
          };
        }
      } else {
        const url = urlJoin(this.gateway, "ipfs", cid);
        const res = await axios.get(
          `${url}?pinataGatewayToken=${this.gatewayKey}`
        );
        const contentType = res.headers["content-type"];
        if (contentType.includes("application/json")) {
          return { data: res.data, error: null };
        } else {
          return {
            data: null,
            error: {
              message: `Error: expecting a JSON object, but received data of type ${contentType}`,
            },
          };
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (axios.isAxiosError(error)) {
          if (error.response) {
            return {
              data: null,
              error: {
                message: `Error: failed to get data, server returned with error code: ${error.response.status}`,
              },
            };
          } else if (error.request) {
            return {
              data: null,
              error: {
                message: "Error: failed to get data, no response received",
              },
            };
          } else {
            return {
              data: null,
              error: {
                message: `Error: unexpected error when trying to get data: ${error.message}`,
              },
            };
          }
        } else {
          return {
            data: null,
            error: {
              message: `Error: unexpected error when trying to get data: ${error.message}`,
            },
          };
        }
      } else {
        return {
          data: null,
          error: {
            message: `Error: unexpected error when trying to get data: ${error}`,
          },
        };
      }
    }
  }
}
