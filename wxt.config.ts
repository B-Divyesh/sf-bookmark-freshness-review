import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Bookmark Freshness Review',
    description: 'Review old bookmarks, check link health, add context, and export a portable archive.',
    version: '1.0.0',
    permissions: ['storage', 'unlimitedStorage'],
    host_permissions: ['<all_urls>'],
    action: { default_title: 'Open Bookmark Freshness Review' }
  },
  outDir: '.output'
});
