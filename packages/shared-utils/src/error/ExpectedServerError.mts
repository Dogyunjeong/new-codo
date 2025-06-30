const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

class ExpectedServerError extends Error {
  private _httpStatusCode: number;
  private _errorData: any;

  public static HTTP_STATUS = HTTP_STATUS;

  constructor(errMsg = "", statusCode = 400, errorData = {}) {
    super(errMsg);
    this._httpStatusCode = statusCode;
    this._errorData = errorData;
  }

  public get isExpected(): boolean {
    return true;
  }

  public get httpStatusCode(): number {
    return this._httpStatusCode;
  }

  public get errorData(): any {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._errorData;
  }
}

export default ExpectedServerError;
export { HTTP_STATUS };
