import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

// Đọc URL từ biến môi trường
const SUPABASE_JWKS_URL = process.env.SUPABASE_JWKS_URL;
if (!SUPABASE_JWKS_URL) {
  throw new Error('SUPABASE_JWKS_URL env variable is required');
}

let cachedKeys: any = null;

async function getSupabasePublicKeys() {
  if (cachedKeys) return cachedKeys;
  const res = await axios.get(SUPABASE_JWKS_URL as string);
  cachedKeys = res.data.keys;
  return cachedKeys;
}

function getKey(header: any, callback: any) {
  getSupabasePublicKeys().then(keys => {
    const signingKey = keys.find((key: any) => key.kid === header.kid);
    if (!signingKey) {
      callback(new Error('No signing key found'));
    } else {
      callback(null, signingKey.x5c[0]);
    }
  });
}

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('No Authorization header');
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded: any = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded);
        });
      });
      request['supabaseUser'] = decoded;
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid JWT: ' + err.message);
    }
  }
} 