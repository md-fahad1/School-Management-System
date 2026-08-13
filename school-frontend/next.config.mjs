/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ hostname: "images.pexels.com" }],
  },
  images: {
    domains: ["images.unsplash.com", "images.pexels.com", "placehold.co"],
  },
  compilerOptions: {
    typeRoots: ["./node_modules/@types", "./src/types"],
  },
};

export default nextConfig;
