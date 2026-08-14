import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LoginAttemptsService } from './login-attempts.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
     useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        // Overridden per-call in AuthService.issueTokenPair(), but kept
        // here as the module-level default.
        signOptions: { expiresIn: config.get<string>('ACCESS_TOKEN_EXPIRES_IN') ?? '15m' },
      }),
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy,LoginAttemptsService],
  exports: [AuthService],
})
export class AuthModule {}
