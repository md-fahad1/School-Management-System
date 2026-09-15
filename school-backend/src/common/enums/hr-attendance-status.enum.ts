import { registerEnumType } from '@nestjs/graphql';
import { HrAttendanceStatus } from '@prisma/client';

registerEnumType(HrAttendanceStatus, { name: 'HrAttendanceStatus' });

export { HrAttendanceStatus };