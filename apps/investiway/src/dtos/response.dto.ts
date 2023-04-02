export type ResponseDto<T> = {
  success: true;
  result: T;
} | {
  success: false;
  error: {
    statusCode: number;
    message: string;
  }
}