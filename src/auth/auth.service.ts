import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      const token = await this.signToken(
        user.id,
        user.email,
      );

      return token;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }

      throw error;
    }
  }

  async signin(dto: AuthDto) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (!user) {
      throw new ForbiddenException(
        'Credentials are incorrect',
      );
    }

    const isPasswordCorrect = await argon.verify(
      user.password,
      dto.password,
    );
    if (!isPasswordCorrect) {
      throw new ForbiddenException(
        'Password incorrect',
      );
    }

    const token = await this.signToken(
      user.id,
      user.email,
    );

    return token;
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ acess_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    return {
      acess_token: await this.jwt.signAsync(
        payload,
        {
          expiresIn: '30m',
          secret: this.config.get('JWT_SECRET'),
        },
      ),
    };
  }
}
