import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Vehicle {
  @Field(() => ID)
  id!: string;

  @Field()
  vehicleNumber!: string;

  @Field()
  type!: string;

  @Field(() => Int)
  capacity!: number;

  @Field()
  driverName!: string;

  @Field({ nullable: true })
  route?: string;

  @Field()
  status!: string;

  @Field(() => ID, { nullable: true })
  transportStaffId?: string;

  @Field({ nullable: true })
  transportStaffName?: string;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}