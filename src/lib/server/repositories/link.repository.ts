/**
 * @file link.repository.ts
 * @description Repository untuk operasi CRUD pada model Link.
 * @deprecated Gunakan server actions di folder actions/ sebagai gantinya.
 */
import prisma from "@/lib/server/db/prisma";

export interface CreateLinkInput {
  slug?: string;
  title?: string;
  description?: string;
  image?: string;
  originalLinkId: string;
  userId: string;
}

export class LinkRepository {
  async createLink(data: CreateLinkInput) {
    return prisma.link.create({
      data,
    });
  }

  async getLinksByUserId(userId: string) {
    return prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
