export class PinataProvider {
  private readonly key: string;
  private readonly gateway: string;

  constructor(key: string, gateway: string) {
    this.key = key;
    this.gateway = gateway;
  }

  async pin(data: unknown): Promise<string> {
    try {
      const preparedData = JSON.stringify({
        pinataContent: data,
      });
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.key}`,
          },
          body: preparedData,
        }
      );
      const resData = await res.json();
      return resData.IpfsHash;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
