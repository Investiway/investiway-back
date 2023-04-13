import {IsAlphanumeric, IsArray, IsEnum, IsInt, IsOptional, IsString, Max, Min} from "class-validator";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {Type} from "class-transformer";

export enum Order {
  Asc = 1,
  Desc = -1,
}


export class PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsAlphanumeric()
  readonly orderField?: string;

  @ApiPropertyOptional({
    enum: Order,
    description: '1: Asc, -1: Desc'
  })
  @IsEnum(Order)
  @IsOptional()
  readonly order?: Order;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 50,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  take?: number = 10;

  get skip(): number {
    return (Number(this.page) - 1) * Number(this.take);
  }

  constructor(data: PageOptionsDto) {
    Object.assign(this, data);
  }
}

export class PageMetaDtoParameters {
  pageOptionDto: PageOptionsDto;
  itemCount: number;
  
  constructor(pageOptionDto: PageOptionsDto, itemCount: number) {
    this.pageOptionDto = pageOptionDto;
    this.itemCount = itemCount;
  }
}

export class PageMetaDto {
  @ApiProperty()
  readonly page: number;

  @ApiProperty()
  readonly take: number;

  @ApiProperty()
  readonly itemCount: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly hasPreviousPage: boolean;

  @ApiProperty()
  readonly hasNextPage: boolean;

  constructor(params: PageMetaDtoParameters) {
    this.page = Number(params.pageOptionDto.page);
    this.take = Number(params.pageOptionDto.take);
    this.itemCount = params.itemCount;
    this.pageCount = Math.ceil(this.itemCount / this.take);
    this.hasPreviousPage = this.page > 1;
    this.hasNextPage = this.page < this.pageCount;
  }
}

export class PageDto<T> {
  @IsArray()
  @ApiProperty({ isArray: true })
  readonly data: T[]

  @ApiProperty({ type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
