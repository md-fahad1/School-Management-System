/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
  compilerOptions: {
    typeRoots: ["./node_modules/@types", "./src/types"],
  },
};

export default nextConfig;
