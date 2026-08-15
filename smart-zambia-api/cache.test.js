import { describe, it, expect, beforeEach } from 'vitest';
import cache from './cache.js';

describe('Cache Module', () => {
  beforeEach(() => {
    cache.clear();
  });

  it('should store and retrieve values', () => {
    cache.set('test-key', 'test-value');
    const value = cache.get('test-key');
    expect(value).toBe('test-value');
  });

  it('should return null for expired entries', async () => {
    cache.set('short-lived', 'value', 1);
    
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    const value = cache.get('short-lived');
    expect(value).toBeNull();
  });

  it('should handle cache expiry correctly', () => {
    cache.set('key1', 'value1', 10);
    const value = cache.get('key1');
    expect(value).toBe('value1');
  });

  it('should delete specific keys', () => {
    cache.set('key-to-delete', 'value');
    cache.delete('key-to-delete');
    
    const value = cache.get('key-to-delete');
    expect(value).toBeNull();
  });

  it('should invalidate keys matching pattern', () => {
    cache.set('destinations:all', 'data1');
    cache.set('destinations:lusaka', 'data2');
    cache.set('users:123', 'data3');
    
    cache.invalidatePattern('^destinations:');
    
    expect(cache.get('destinations:all')).toBeNull();
    expect(cache.get('destinations:lusaka')).toBeNull();
    expect(cache.get('users:123')).toBe('data3');
  });

  it('should clear all cache entries', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    
    cache.clear();
    
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
    expect(cache.get('key3')).toBeNull();
  });
});
