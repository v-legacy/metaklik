/**
 * Basic tests for MetadataService
 */

import { describe, it, expect } from 'vitest';
import { MetadataService } from './metadata-service';

describe('MetadataService', () => {
  it('should reject invalid URLs', async () => {
    const service = new MetadataService();
    const result = await service.extractMetadata('not-a-url');

    expect(result).toHaveProperty('code', 'INVALID_URL');
    expect(result).toHaveProperty('error');
  });

  it('should reject URLs with unsupported protocols', async () => {
    const service = new MetadataService();
    const result = await service.extractMetadata('ftp://example.com');

    expect(result).toHaveProperty('code', 'INVALID_URL');
    expect(result).toHaveProperty('error');
  });

  it('should reject URLs that are too long', async () => {
    const service = new MetadataService();
    const longUrl = 'https://example.com/' + 'a'.repeat(2100);
    const result = await service.extractMetadata(longUrl);

    expect(result).toHaveProperty('code', 'INVALID_URL');
    expect(result).toHaveProperty('error');
  });

  it('should reject URLs with malicious patterns', async () => {
    const service = new MetadataService();
    const result = await service.extractMetadata('javascript:alert(1)');

    expect(result).toHaveProperty('code', 'INVALID_URL');
    expect(result).toHaveProperty('error');
  });
});
