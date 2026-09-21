import { registerEnumType } from '@nestjs/graphql';
import { GuardianRelation } from '@prisma/client';

registerEnumType(GuardianRelation, { name: 'GuardianRelation' });

export { GuardianRelation };