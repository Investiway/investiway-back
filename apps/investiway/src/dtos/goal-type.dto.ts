import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";
import {IsOptional, IsString, Max, MaxLength, Min, MinLength} from "class-validator";
import {IsObjectId} from "../validators/is-object-id.validate";

export class GoalTypeSearchQuery {
  @ApiPropertyOptional()
  @IsOptional()
  search: string;
  
  @ApiPropertyOptional()
  @IsOptional()
  @IsObjectId()
  userId: string;
}

export class GoalTypeGetOneParams {
  @ApiProperty()
  @IsObjectId()
  id: string
}

export class GoalTypeDeleteParams {
  @ApiProperty()
  @IsObjectId()
  id: string
}

export class GoalTypeCreateOrEditParams {
  @ApiProperty()
  @IsObjectId()
  id: string
}

export class GoalTypeCreateOrEditBody {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name: string;
  
  @ApiProperty()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(1024)
  description: string;
  
  @ApiProperty()
  @IsObjectId()
  userId: string;
}