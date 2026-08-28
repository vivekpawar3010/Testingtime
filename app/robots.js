export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/customer/',
        '/super-admin/',
        '/api/'
      ],
    },
    sitemap: 'https://messfind.adviks.com/sitemap.xml',
  };
}
