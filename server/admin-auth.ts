import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export type Credential = { salt: string; hash: string; updatedAt: string };

// Server-only bootstrap credential. Never import this module from browser code.
export const initialCredential: Credential = {
  salt: 'e0a870e9f47f3072d18422adffc7d03b',
  hash: '2231bc8d44f5681ea267ad2b631125f3f29f49f75ce71f1863a8376bda4e03325feb85aa646227eb5898fc2d5a7e68c0391562edc7f8374283da7d0b07ec9d44',
  updatedAt: '',
};

export function matchesCredential(supplied: string, record: Credential): boolean {
  if (typeof supplied !== 'string' || supplied.length < 8 || supplied.length > 128) return false;
  if (!record || !/^[a-f0-9]{32}$/.test(record.salt) || !/^[a-f0-9]{128}$/.test(record.hash)) return false;
  const computed = scryptSync(supplied, Buffer.from(record.salt, 'hex'), 64);
  return timingSafeEqual(computed, Buffer.from(record.hash, 'hex'));
}

export function createCredential(password: string): Credential {
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: scryptSync(password, Buffer.from(salt, 'hex'), 64).toString('hex'), updatedAt: new Date().toISOString() };
}

export function validNewPassword(password: unknown): password is string {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128 || password !== password.trim()) return false;
  const categories = Number(/[A-Za-z]/.test(password)) + Number(/[0-9]/.test(password)) + Number(/[\p{P}\p{S}]/u.test(password));
  return categories >= 2;
}
