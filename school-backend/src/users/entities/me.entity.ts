import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Role } from '@prisma/client';

// Role is already registered as a GraphQL enum in auth/dto/auth.dto.ts —
// importing the type here is enough, no need to registerEnumType again.

@ObjectType()
export class Me {
  @Field(() => ID)
  id!: string;

  @Field()
  username!: string;

  @Field()
  email!: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => Role)
  role!: Role;

  @Field({ nullable: true })
  img?: string;
    @Field()
  emailNotifications!: boolean;

  @Field()
  name!: string;

  @Field()
  surname!: string;
}