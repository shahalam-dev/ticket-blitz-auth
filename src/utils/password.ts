import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(scrypt);

// Split the logic: Salt (random data) + Hash
export const hashPassword = async (password: string): Promise<string> => {
    // 1. Generate a random salt (16 bytes is standard)
    const salt = randomBytes(16).toString('hex');

    // 2. Hash the password using the salt (Key length 64)
    // This executes in the internal C++ Thread Pool (UV_THREADPOOL)
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    // 3. Store as "salt:hash" so we can verify later
    return `${salt}:${derivedKey.toString('hex')}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    // 1. Extract the salt from the stored string
    const [salt, key] = storedHash.split(':');

    const keyBuffer = Buffer.from(key, 'hex');

    // 2. Hash the input password using the SAME salt
    const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

    // 3. Compare safely (prevents Timing Attacks)
    return timingSafeEqual(keyBuffer, derivedKey);
};