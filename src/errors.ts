export class PinataPinningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PinataPinningError";
  }
}
