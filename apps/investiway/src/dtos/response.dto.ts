import {ApiProperty} from "@nestjs/swagger";

export class ResponseSuccessDto<T> {
  @ApiProperty()
  success: true;
  
  @ApiProperty()
  result: T;
}

export class ResponseErrorDto {
  @ApiProperty()
  success: false;
  
  @ApiProperty()
  error: {
    statusCode: number;
    message: string;
  }
}

export type ResponseDto<T> = ResponseSuccessDto<T> | ResponseErrorDto;
