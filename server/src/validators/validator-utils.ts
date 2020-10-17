import { ValidationErrors } from "fluentvalidation-ts/dist/ValidationErrors";

export function hasValidationErrors<T>(ve: ValidationErrors<T>): boolean {
  return 0 < Object.keys(ve).length;
}
