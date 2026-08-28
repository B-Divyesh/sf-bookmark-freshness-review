import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Bookmark Freshness Review',
    description: 'Review old bookmarks, check link health, add context, and export a portable archive.',
    version: '1.0.0',
    permissions: ['storage', 'unlimitedStorage'],
    host_permissions: ['<all_urls>'],
    icons: { 16: 'icon/16.png', 32: 'icon/32.png', 48: 'icon/48.png', 128: 'icon/128.png' },
    action: { default_title: 'Open Bookmark Freshness Review', default_icon: { 16: 'icon/16.png', 32: 'icon/32.png' } },
    options_ui: { page: 'options.html', open_in_tab: true }
  },
  outDir: '.output'
});
