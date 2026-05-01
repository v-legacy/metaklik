'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/server/db/prisma";
import { MetadataService } from '@/lib/services/metadata-service';

export interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  displayUrl?: string | null;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

type FormData = {
  title: string;
  image: string;
  description: string;
};

export async function getLink(urlToFetch: string) {
  try {
    const service = new MetadataService();
    const result = await service.extractMetadata(urlToFetch);

    if ('code' in result) {
      console.error("Metadata extraction error:", result.error);
      return null;
    }

    console.log("Extracted Metadata:", result);
    return result as MetadataResult;
  } catch (error: unknown) {
    console.error("Error in getLink:", error);
    return null;
  }
}

function generateShortCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createLink(data: FormData, ogData: MetadataResult) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return { success: false, error: "Unauthorized. Please log in first." };
    }

    const userId = (session.user as any).id;

    console.log("data OG", ogData);


    // 1. Upsert OriginalLink
    const originalLink = await prisma.originalLink.upsert({
      where: { url: ogData.url },
      update: {}, // No updates if it exists
      create: {
        url: ogData.url,
        title: ogData.title,
        description: ogData.description,
        image: ogData.image,
        domain: ogData.displayUrl,
        type: ogData.type,
      }
    });

    // 2. Generate and Verify Unique Shortlink
    let uniqueSlug = generateShortCode();
    let isSlugUnique = false;
    let attempts = 0;

    while (!isSlugUnique && attempts < 5) {
      const existing = await prisma.link.findUnique({ where: { slug: uniqueSlug } });
      if (!existing) {
        isSlugUnique = true;
      } else {
        uniqueSlug = generateShortCode();
        attempts++;
      }
    }

    if (!isSlugUnique) {
      return { success: false, error: "Failed to generate a unique shortlink. Please try again." };
    }

    // 3. Create the Custom Link
    const newLink = await prisma.link.create({
      data: {
        slug: uniqueSlug,
        title: data.title,
        description: data.description,
        image: data.image,
        originalLinkId: originalLink.id,
        userId: userId,
      }
    });

    return { success: true, link: newLink };
  } catch (error: any) {
    console.error("Error creating link:", error);
    return { success: false, error: error.message || "Failed to create link" };
  }
}
