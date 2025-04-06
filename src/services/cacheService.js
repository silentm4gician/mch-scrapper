const cache = new Map();

export async function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;

  const { value, expiry } = cached;
  if (Date.now() > expiry) {
    cache.delete(key);
    return null;
  }
  return value;
}

export async function setCache(key, data, ttl = 3600) {
  const expiry = Date.now() + ttl * 1000;
  cache.set(key, { value: data, expiry });
}
