import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLink } from './link-actions';
import prisma from '@/lib/server/db/prisma';
import * as nextAuth from 'next-auth';

// Mock NextAuth getServerSession
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock Prisma
vi.mock('@/lib/server/db/prisma', () => ({
  default: {
    originalLink: {
      upsert: vi.fn(),
    },
    link: {
      create: vi.fn(),
    },
  },
}));

describe('createLink Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error if user is not authenticated', async () => {
    // Mock unauthorized user
    vi.mocked(nextAuth.getServerSession).mockResolvedValueOnce(null);

    const formData = { title: 'Test', description: 'Test', image: 'test.jpg' };
    const ogData = { url: 'https://test.com', title: '', description: '', image: null, siteName: null };

    const result = await createLink(formData as any, ogData as any);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Unauthorized');
  });

  it('should successfully upsert OriginalLink and create Custom Link if authenticated', async () => {
    // Mock authenticated user
    vi.mocked(nextAuth.getServerSession).mockResolvedValueOnce({
      user: { id: 'user-123', name: 'Test User', email: 'test@test.com' },
      expires: '123'
    } as any);

    // Mock prisma responses
    vi.mocked(prisma.originalLink.upsert).mockResolvedValueOnce({
      id: 'original-link-123',
      url: 'https://shopee.co.id/test',
    } as any);

    vi.mocked(prisma.link.create).mockResolvedValueOnce({
      id: 'custom-link-123',
      title: 'My Custom Title',
      originalLinkId: 'original-link-123',
    } as any);

    const formData = { 
      title: 'My Custom Title', 
      description: 'My Description', 
      image: 'my-image.jpg' 
    };
    
    const ogData = { 
      url: 'https://shopee.co.id/test', 
      title: 'Original Title', 
      description: 'Original Desc', 
      image: 'original-image.jpg',
      displayUrl: 'shopee.co.id',
      type: 'website'
    };

    const result = await createLink(formData as any, ogData as any);

    // Verify successful response
    expect(result.success).toBe(true);
    expect((result as any).link.id).toBe('custom-link-123');

    // Verify Prisma OriginalLink Upsert was called with correct arguments
    expect(prisma.originalLink.upsert).toHaveBeenCalledWith({
      where: { url: 'https://shopee.co.id/test' },
      update: {},
      create: {
        url: 'https://shopee.co.id/test',
        title: 'Original Title',
        description: 'Original Desc',
        image: 'original-image.jpg',
        domain: 'shopee.co.id',
        type: 'website',
      }
    });

    // Verify Prisma Link Create was called with correct arguments
    expect(prisma.link.create).toHaveBeenCalledWith({
      data: {
        title: 'My Custom Title',
        description: 'My Description',
        image: 'my-image.jpg',
        originalLinkId: 'original-link-123',
        userId: 'user-123',
      }
    });
  });
});
