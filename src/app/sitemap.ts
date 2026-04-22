import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.giftheranapp.com',
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: 'https://www.giftheranapp.com/build',
      lastModified: new Date(),
      priority: 0.9,
    },
    {
      url: 'https://www.giftheranapp.com/terms',
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: 'https://www.giftheranapp.com/privacy',
      lastModified: new Date(),
      priority: 0.3,
    },
    {
      url: 'https://www.giftheranapp.com/refund',
      lastModified: new Date(),
      priority: 0.3,
    },
  ]
}
