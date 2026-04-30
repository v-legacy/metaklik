import React from 'react';

interface PreviewProps {
  title?: string;
  description?: string;
  image?: string;
  domain?: string;
}

export default function Preview({ title, description, domain, image }: PreviewProps) {
  return (
    <div className="flex flex-col h-full">
      <h2 className='text-xl font-bold mb-6 text-slate-800'>Card Preview</h2>

      {/* Social Media Card Container */}
      <div className="max-w-md mx-auto w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

        {/* Image Section */}
        <div className='bg-slate-100 w-full aspect-[1.91/1] relative flex items-center justify-center border-b border-gray-200 overflow-hidden'>
          {image ? (
            <img
              src={image}
              alt='OG Image Preview'
              className='w-full h-full object-contain bg-black/5'
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <img
                src='/file.svg'
                alt='Placeholder'
                className='w-12 h-12 opacity-30 mb-2'
              />
              <span className="text-sm">No image selected</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 bg-slate-50">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
            {domain || 'metaklik.biz.id'}
          </p>
          <h3 className='text-base font-bold text-slate-900 leading-snug line-clamp-2 mb-1'>
            {title || 'Your engaging title goes here and can wrap to multiple lines'}
          </h3>
          <p className='text-sm text-slate-600 line-clamp-3 break-words'>
            {description || 'This is how your description will appear in the link preview. Make it concise and engaging to attract clicks.'}
          </p>
        </div>
      </div>

      <div className="mt-8 text-sm text-slate-500 text-center bg-blue-50 p-3 rounded-lg border border-blue-100">
        💡 <strong>Pro Tip:</strong> Ensure your image is clear and your text is compelling. This preview approximates how it will look on platforms like Twitter and Facebook.
      </div>
    </div>
  );
}
