import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class ImportFailure {
  @Field(() => Int)
  row!: number;

  @Field()
  error!: string;
}

@ObjectType()
export class ImportResult {
  @Field(() => Int)
  created!: number;

  @Field(() => [ImportFailure])
  failed!: ImportFailure[];
}