export type ProviderType = "pinata";

export type HatsDetailsClientConfig = {
  provider: ProviderType;
  pinata?: {
    key: string;
    gateway: string;
  };
};
