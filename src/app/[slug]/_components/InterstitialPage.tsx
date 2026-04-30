/**
 * @file InterstitialPage.tsx
 * @description UI komponen branded untuk halaman interstitial shortlink.
 * Menampilkan preview card (gambar, judul, deskripsi), countdown, dan branding MetaKlik.
 * Digunakan oleh [slug]/page.tsx sebagai wrapper visual.
 */
interface InterstitialPageProps {
  title: string;
  description: string;
  image: string | null;
  domain: string;
  originalUrl: string;
  children: React.ReactNode; // RedirectHandler akan ditempatkan di sini
}

export default function InterstitialPage({
  title,
  description,
  image,
  domain,
  originalUrl,
  children,
}: InterstitialPageProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4'>
      {/* Logo */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold text-white tracking-tight'>
          Meta<span className='text-blue-400'>Klik</span>
        </h1>
      </div>

      {/* Preview Card */}
      <div className='w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden'>
        {/* Image */}
        {image && (
          <div className='w-full h-48 overflow-hidden bg-slate-100'>
            <img
              src={image}
              alt={title}
              className='w-full h-full object-cover'
            />
          </div>
        )}

        {/* Content */}
        <div className='p-6'>
          <p className='text-xs text-blue-600 font-medium uppercase tracking-wide mb-1'>
            {domain}
          </p>
          <h2 className='text-lg font-bold text-slate-900 mb-2 line-clamp-2'>
            {title}
          </h2>
          <p className='text-sm text-slate-500 line-clamp-3 mb-4'>
            {description}
          </p>

          {/* Redirect Status - RedirectHandler goes here */}
          {children}
        </div>
      </div>

      {/* Original URL hint */}
      <p className='mt-4 text-xs text-slate-400 max-w-md text-center break-all'>
        Menuju: {originalUrl}
      </p>

      {/* Branding Footer */}
      <p className='mt-8 text-xs text-slate-500'>
        Powered by{' '}
        <a
          href='/'
          className='text-blue-400 hover:text-blue-300 transition-colors'
        >
          MetaKlik
        </a>
      </p>

      {/* Noscript Fallback */}
      <noscript>
        <meta httpEquiv='refresh' content={`5;url=${originalUrl}`} />
        <p className='mt-4 text-white text-sm'>
          JavaScript diperlukan. Anda akan dialihkan dalam 5 detik, atau{' '}
          <a href={originalUrl} className='text-blue-400 underline'>
            klik di sini
          </a>
          .
        </p>
      </noscript>
    </div>
  );
}
