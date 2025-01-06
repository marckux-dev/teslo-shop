import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {

  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  @MinLength(3)
  @IsOptional()
  description?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @MinLength(3)
  @IsOptional()
  slug?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  sizes?: string[];

  @IsString()
  @IsOptional()
  @IsIn(['men', 'women', 'kid', 'unisex'])
  gender?: string;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
