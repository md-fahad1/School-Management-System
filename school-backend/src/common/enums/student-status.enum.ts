import { registerEnumType } from '@nestjs/graphql';
import { StudentStatus } from '@prisma/client';

registerEnumType(StudentStatus, { name: 'StudentStatus' });

export { StudentStatus };