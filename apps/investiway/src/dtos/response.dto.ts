import {ApiProperty} from "@nestjs/swagger";

export class ResponseSuccessDto<T> {
  @ApiProperty({ default: true })
  success: true;
  
  @ApiProperty()
  result: T;
}

export class ResponseErrorDataDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;
}

export class ResponseErrorDto {
  @ApiProperty({ default: false })
  success: false;
  
  @ApiProperty()
  error: ResponseErrorDataDto;
}

export type ResponseDto<T> = ResponseSuccessDto<T> | ResponseErrorDto;