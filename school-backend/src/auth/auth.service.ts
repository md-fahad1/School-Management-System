import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginInput, RegisterInput, AuthPayload } from './dto/auth.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    // STUDENT accounts require a class/grade/parent link, so they're
    // created through the students module (which also creates the User
    // record in a transaction). This endpoint covers ADMIN, TEACHER,
    // and PARENT, which have no required relations at creation time.
    if (input.role === Role.STUDENT) {
      throw new BadRequestException(
        'Student accounts must be created via the students.create mutation',
      );
    }

    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ username: input.username }, { email: input.email }] },
    });
    if (existing) throw new BadRequestException('Username or email already in use');

    const hashed = await bcrypt.hash(input.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        password: hashed,
        role: input.role,
        ...(input.role === Role.ADMIN && {
          admin: { create: { name: input.name, surname: input.surname } },
        }),
        ...(input.role === Role.TEACHER && {
          teacher: { create: { name: input.name, surname: input.surname } },
        }),
        ...(input.role === Role.PARENT && {
          parent: { create: { name: input.name, surname: input.surname } },
        }),
      },
    });

    return this.signToken(user.id, user.username, user.role);
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({ where: { username: input.username } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(input.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.signToken(user.id, user.username, user.role);
  }

  private signToken(sub: string, username: string, role: Role): AuthPayload {
    const accessToken = this.jwt.sign({ sub, username, role });
    return { accessToken, id: sub, username, role };
  }
}
