/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config, options) {
    config.module.rules.push({
      test: /\.wav$/,
      use: {
        loader: 'file-loader',
      },
    })
    return config
  },
}

module.exports = nextConfig
