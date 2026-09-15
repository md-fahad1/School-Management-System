import { registerEnumType } from '@nestjs/graphql';
import { LeaveType } from '@prisma/client';

registerEnumType(LeaveType, { name: 'LeaveType' });

export { LeaveType };