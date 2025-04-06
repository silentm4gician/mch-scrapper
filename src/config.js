import dotenv from 'dotenv';
dotenv.config();

export const BASE_URL = process.env.BASE_URL;
export const CACHE_TTL = process.env.CACHE_TTL || 3600;
