import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Site Configuration
const siteConfig = {
  name: 'MetaKlik',
  title: 'MetaKlik - Open Graph as a Service',
  description:
    'Create and customize your Open Graph tags effortlessly. Generate beautiful link previews for social media with MetaKlik - the ultimate OG tag customization service.',
  shortDescription:
    'Create and customize your Open Graph tags effortlessly. Generate beautiful link previews for social media with MetaKliks.',
  url: process.env.NEXT_PUBLIC_BASE_URL || 'https://www.metaklik.biz.id',
  ogImage: `https://7eb26161a87b.ngrok-free.app/assets/metaklik.png`,
  ogImageWidth: 1024,
  ogImageHeight: 1024,
  twitterHandle: '@metaklik',
  keywords: [
    'metaklik',
    'open graph',
    'og tags',
    'meta tags',
    'social media preview',
    'link preview',
    'customization',
    'seo',
    'twitter card',
    'facebook preview',
  ],
  locale: 'en_US',
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: '/',
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: siteConfig.ogImageWidth,
        height: siteConfig.ogImageHeight,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.shortDescription,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/metaklik.ico',
    shortcut: '/metaklik.ico',
    apple: '/metaklik.ico',
  },
  verification: {
    // Add your verification tokens when ready
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
};

import AuthProvider from '@/components/providers/AuthProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
