export class ApiValidationError extends Error {
  public errors: Record<string, string[]>;

  constructor(message: string, errors: Record<string, string[]>) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
  }
}
