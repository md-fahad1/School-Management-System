import { BadRequestException } from '@nestjs/common';

/**
 * Belt-and-suspenders on top of DTO-level @MinLength(6) checks —
 * requires at least one letter and one number so "111111" doesn't
 * pass. Shared between registration and password reset so the two
 * flows can't drift into inconsistent rules.
 */
export function assertPasswordComplexity(password: string): void {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    throw new BadRequestException('Password must contain at least one letter and one number');
  }
}