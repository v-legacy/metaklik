import React from 'react';

const Hero = () => {
  return (
    <section className="relative pt-16 sm:pt-20 md:pt-24 lg:pt-28 pb-32 sm:pb-40 md:pb-48">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#C9EBFF,transparent)]"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 leading-tight">
          <span className="block sm:inline">Craft the Perfect First Impression,</span>
          <span className="block sm:inline text-indigo-600"> Every Single Time.</span>
        </h1>
        <p className="mt-4 sm:mt-6 max-w-xl md:max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-600 px-4 sm:px-0">
          Tired of generic link previews? Take control of your content&apos;s narrative. MetaKlik helps you create stunning, custom Open Graph tags in seconds. Boost your click-through rates and brand presence effortlessly.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center px-4 sm:px-0">
          <a
            href="/links"
            className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 border border-transparent rounded-md shadow-sm text-sm sm:text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Get Started for Free
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto px-6 sm:px-8 md:px-10 py-3 border border-indigo-600 rounded-md shadow-sm text-sm sm:text-base font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
          >
            Learn More
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-20 sm:h-24 md:h-28" style={{ transform: 'translateY(1px)' }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="w-full h-full text-slate-900">
          <path d="M0,0 C480,100 960,100 1440,0 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
