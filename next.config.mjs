/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'mixx.co.tz',
            },
            {
                protocol: 'https',
                hostname: 'www.mixx.co.tz',
            },
            {
                protocol: 'https',
                hostname: 'images.crunchbase.com',
            },
            {
                protocol: 'https',
                hostname: 'logowik.com',
            },
            {
                protocol: 'https',
                hostname: 'wp.logos-download.com',
            },
            {
                protocol: 'https',
                hostname: 'play-lh.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
            },
            {
                protocol: 'https',
                hostname: 'mukuruo.site',
            },
            {
                protocol: 'https',
                hostname: 'cdn.countryflags.com',
            },
        ],
    },
};

export default nextConfig;
