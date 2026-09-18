import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class CreateVehicleInput {
  @Field()
  @IsString()
  vehicleNumber!: string;

  @Field()
  @IsString()
  type!: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  capacity!: number;

  @Field()
  @IsString()
  driverName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  route?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  transportStaffId?: string;
}

@InputType()
export class UpdateVehicleInput extends PartialType(CreateVehicleInput) {}