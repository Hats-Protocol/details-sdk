import axios from "axios";
import urlJoin from "url-join";
import { PinataPinningError, PinataGetDataError } from "../errors";

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

  async get(cid: string): Promise<unknown> {
    if (this.gateway === undefined) {
      try {
        const res = await axios.get(`https://ipfs.io/ipfs/${cid}`);
        if (res.status === 200) {
          return res.data;
        } else {
          throw new PinataGetDataError(
            `Error: failed to get data, gateway returned with error code: ${res.status}`
          );
        }
      } catch (error) {
        throw new PinataGetDataError(
          "Error: unexpected error when trying to get data"
        );
      }
    } else if (this.gatewayKey === undefined) {
      try {
        const url = urlJoin(this.gateway, "ipfs", cid);
        const res = await axios.get(`${url}`);
        if (res.status === 200) {
          return res.data;
        } else {
          throw new PinataGetDataError(
            `Error: failed to get data, gateway returned with error code: ${res.status}`
          );
        }
      } catch (error) {
        throw new PinataGetDataError(
          "Error: unexpected error when trying to get data"
        );
      }
    } else {
      try {
        const url = urlJoin(this.gateway, "ipfs", cid);
        const res = await axios.get(
          `${url}?pinataGatewayToken=${this.gatewayKey}`
        );
        if (res.status === 200) {
          return res.data;
        } else {
          throw new PinataGetDataError(
            `Error: failed to get data, gateway returned with error code: ${res.status}`
          );
        }
      } catch (error) {
        throw new PinataGetDataError(
          "Error: unexpected error when trying to get data"
        );
      }
    }
  }
}
