export class HashMap<K, V> {
  private buckets: Array<Array<[K, V]>>;
  private size: number;

  constructor(size: number = 10) {
    this.buckets = Array.from({ length: size }, () => []);
    this.size = size;
  }

  private hash(key: K): number {
    const keyStr = String(key);
    let hash = 5381;

    for (let i = 0; i < keyStr.length; i++) {
      hash = (hash << 5) - hash + keyStr.charCodeAt(i);
      hash |= 0;
    }

    return Math.abs(hash) % this.size;
  }

  set(key: K, value: V): this {
    const bucket = this.hash(key);
    const existingIndex = this.buckets[bucket].findIndex(([k]) => k === key);

    if (existingIndex >= 0) {
      this.buckets[bucket][existingIndex][1] = value;
    } else {
      this.buckets[bucket].push([key, value]);
    }
    return this;
  }

  get(key: K): V | undefined {
    const bucket = this.hash(key);
    const pair = this.buckets[bucket].find(([k]) => k === key);
    return pair?.[1];
  }

  has(key: K): boolean {
    const bucket = this.hash(key);

    return this.buckets[bucket].some(([k]) => k === key);
  }

  *entries(): IterableIterator<[K, V]> {
    for (const bucket of this.buckets) {
      for (const [key, value] of bucket) {
        yield [key, value];
      }
    }
  }

  *keys(): IterableIterator<K> {
    for (const bucket of this.buckets) {
      for (const [key] of bucket) {
        yield key;
      }
    }
  }

  *values(): IterableIterator<V> {
    for (const bucket of this.buckets) {
      for (const [_, value] of bucket) {
        yield value;
      }
    }
  }

  delete(key: K): boolean {
    const bucket = this.hash(key);

    const itemIndex = this.buckets[bucket].findIndex(([k]) => k === key);

    if (itemIndex >= 0) {
      this.buckets[bucket].splice(itemIndex, 1);
      return true;
    }

    return false;
  }
}
