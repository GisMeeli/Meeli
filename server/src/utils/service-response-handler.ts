export function buildErrorResponse(errorData: any): any {
  return {
    error: errorData
  };
}

export function isErrorResponse(data: any): boolean {
  return data.error != undefined;
}
