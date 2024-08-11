export class PinataPinningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PinataPinningError";
  }
}

export class PinataGetDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PinataGetDataError";
  }
}
