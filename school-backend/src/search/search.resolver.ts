import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { SearchService } from './search.service';
import { SearchResult } from './entities/search-result.entity';
import { GqlJwtAuthGuard } from '../auth/guards/gql-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Resolver()
@UseGuards(GqlJwtAuthGuard, RolesGuard)
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Query(() => [SearchResult])
  @Roles(Role.ADMIN, Role.TEACHER, Role.PRINCIPAL, Role.ACCOUNTANT, Role.LIBRARIAN)
  globalSearch(@Args('query') query: string) {
    return this.searchService.search(query);
  }
}