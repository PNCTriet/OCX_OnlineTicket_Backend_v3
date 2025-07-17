import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.SUPABASE_JWT_SECRET,
      algorithms: [process.env.SUPABASE_JWT_ALGORITHM || 'HS256'],
    });
  }

  async validate(payload: any) {
    // Return the entire payload for Supabase JWT
    return payload;
  }
} 