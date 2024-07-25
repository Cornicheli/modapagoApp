class ScannerError extends Error {
   constructor(message: string) {
      super(message);
      this.name = "ScannerError";
   }
}

class RequestError extends Error {
   constructor(message: string) {
      super(message);
      this.name = "RequestError";
   }
}

export { ScannerError, RequestError }