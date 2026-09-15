import { registerEnumType } from '@nestjs/graphql';
import { LeaveStatus } from '@prisma/client';

registerEnumType(LeaveStatus, { name: 'LeaveStatus' });

export { LeaveStatus };