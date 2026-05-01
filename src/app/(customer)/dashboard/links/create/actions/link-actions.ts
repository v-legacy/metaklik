'use server';

import { MetadataService } from '@/lib/services/metadata-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface MetadataResult {
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
  url: string;
  displayUrl?: string | null;
  video?: string | null;
  type?: 'image' | 'video' | 'article' | 'website';
}

interface APISuccessResponse {
  success: true;
  data: MetadataResult;
}

interface APIErrorResponse {
  success: false;
  error: string;
  code:
  | 'INVALID_URL'
  | 'UNREACHABLE'
  | 'TIMEOUT'
  | 'PARSE_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'UNKNOWN';
  retryAfter?: number;
}

type APIResponse = APISuccessResponse | APIErrorResponse;
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
      console.log("API Error:", result.error);
      return null;
    }

    console.log("Fetch Data", result);
    return result;
  } catch (error: unknown) {
    console.log("error", error);
    return null;
  }
}
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/server/db/prisma";

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
