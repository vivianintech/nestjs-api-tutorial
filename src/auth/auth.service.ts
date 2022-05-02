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
    // generate password hash
    const hash = await argon.hash(dto.password);

    try {
      // save the new user in the db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      // delete user.hash;
      // return user;
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          // P2002 stands for duplicate field
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    // find user by email
    const user = this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      // if user does not exist throw exception
      throw new ForbiddenException(
        'Credentials Incorrect',
      );
    }

    // compare password
    const passwordMatches = await argon.verify(
      (
        await user
      ).hash,
      dto.password,
    );
    // if password incorrect throw exception
    if (!passwordMatches) {
      throw new ForbiddenException(
        'Credentials Incorrect',
      );
    }

    // delete (await user).hash;
    // send back the user
    return this.signToken(
      (await user).id,
      (await user).email,
    );
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );

    return { access_token: token };
  }
}
