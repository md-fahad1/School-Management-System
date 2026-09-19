import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CustomRolesService } from './custom-roles.service';
import { PermissionsResolver } from './permissions.resolver';

// @Global() — AuditModule er moto, jate PermissionsGuard je-kono
// module e constructor injection diye eta pete pare, alada kore
// import kora chhara.
@Global()
@Module({
  providers: [PermissionsService, CustomRolesService, PermissionsResolver],
  exports: [PermissionsService, CustomRolesService],
})
export class PermissionsModule {}