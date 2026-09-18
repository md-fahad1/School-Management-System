import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCertificateDto {
  @IsString()
  @MinLength(2)
  type!: string; // e.g. "Certificate of Achievement", "Character Certificate", "Transfer Certificate"

  @IsString()
  @MinLength(2)
  title!: string; // heading printed on the certificate

  @IsString()
  @MinLength(5)
  body!: string; // main paragraph text; use {name} where the student's full name should go

  @IsOptional()
  @IsString()
  issuedDate?: string; // ISO date string; defaults to today
}