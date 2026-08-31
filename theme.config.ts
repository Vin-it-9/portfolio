import { defineThemeConfig } from '@utils/defineThemeConfig'
import logoImage from '@assets/img/logo.svg'

export default defineThemeConfig({
  name: 'Vinit Shinde',
  id: 'vinit-shinde-portfolio',
  logo: logoImage,
  seo: {
    title: 'Vinit Shinde',
    description:
      'Portfolio of Vinit Shinde, a Java Developer.',
    author: 'Vinit Shinde',
  },
  colors: {
    primary: '#d648ff',
    secondary: '#00d1b7',
    neutral: '#b9bec4',
    outline: '#ff4500',
  },
  navigation: {
    darkmode: true,
    items: [
      {
        type: 'link',
        label: 'Home',
        href: '/',
      },
      {
        type: 'link',
        label: 'Blog',
        href: '/blog',
      },
      {
        type: 'link',
        label: 'Projects',
        href: '/portfolio',
      },
      {
        label: 'Features',
        type: 'dropdown',
        items: [
          {
            label: 'Accessibility statement',
            href: '/accessibility-statement',
          },
          {
            label: 'Accessible components',
            href: '/accessible-components',
          },
          {
            label: 'Accessible launcher',
            href: '/accessible-launcher',
          },
          {
            label: 'Color contrast checker',
            href: '/color-contrast-checker',
          },
          {
            label: 'Markdown page',
            href: '/markdown-page',
          },
          {
            label: 'MDX page',
            href: '/mdx-page',
          },
          {
            label: '404 page',
            href: '/404',
          },
          {
            label: 'Sitemap',
            href: '/sitemap',
          },
        ],
      },
      {
        type: 'link',
        label: 'Contact',
        href: '/contact',
      },
      {
        type: 'link',
        label: 'Go to our GitHub page, opens in new tab',
        href: 'https://github.com/Vin-it-9/',
        icon: 'lucide:github',
        external: true,
        excludeFromLauncher: true,
      },
      {
        type: 'link',
        label: 'Go to our LinkedIn page, opens in new tab',
        href: 'https://www.linkedin.com/in/vinit-shinde-920531254/',
        icon: 'lucide:linkedin',
        external: true,
        excludeFromLauncher: true,
      },
    ],
  },
  socials: [
    {
      label: 'GitHub',
      href: 'https://github.com/Vin-it-9/',
      icon: 'lucide:github',
    },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/vinit-shinde-920531254/',
      icon: 'lucide:linkedin',
    }
  ],
})
