export interface ValidatorError {
  path: string;
  message?: string;
}

export interface ValidatorResult {
  isValid: boolean;
  errors?: ValidatorError[] | null;
}
