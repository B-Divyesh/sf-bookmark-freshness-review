import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

describe('static deployment routes', () => {
  test('serves known client routes without turning unknown URLs into HTTP 200', () => {
    const config = JSON.parse(readFileSync('site/public/staticwebapp.config.json', 'utf8')) as {
      navigationFallback?: unknown;
      routes: Array<{ route: string; rewrite?: string; statusCode?: number }>;
      responseOverrides: Record<string, { rewrite?: string; statusCode?: number }>;
    };

    expect(config.navigationFallback).toBeUndefined();
    for (const route of ['/demo', '/privacy', '/terms']) {
      expect(config.routes).toContainEqual({ route, rewrite: '/index.html' });
    }
    expect(config.routes.every(route => !(route.rewrite && route.statusCode))).toBe(true);
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
  });
});
