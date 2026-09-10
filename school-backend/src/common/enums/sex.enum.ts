import { registerEnumType } from '@nestjs/graphql';
import { Sex } from '@prisma/client';

registerEnumType(Sex, { name: 'Sex' });

export { Sex };