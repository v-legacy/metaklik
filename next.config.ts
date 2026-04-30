import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: {
    compilationMode: 'annotation',
  },
  turbopack: {},
};

export default nextConfig;
