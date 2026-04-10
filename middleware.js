import { NextResponse } from 'next/server';

// ✅ Simple in-memory cache (Edge-safe)
let cachedRedirects = null;
let lastFetchTime = 0;

async function getRedirects(backendUrl) {
  const now = Date.now();

  // ⏱ cache لمدة 60 ثانية
  if (cachedRedirects && now - lastFetchTime < 60000) {
    return cachedRedirects;
  }

  try {
    const res = await fetch(`${backendUrl}/wp-json/crm/v1/redirects`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      cachedRedirects = Array.isArray(data) ? data : [];
      lastFetchTime = now;
      return cachedRedirects;
    }
  } catch (err) {
    console.error('Redirect fetch error:', err);
  }

  return [];
}

export async function middleware(request) {
  const { pathname, locale } = request.nextUrl;

  // ==============================
  // ✅ 1. Handle default locale → /en
  // ==============================
  if (locale === 'default') {
    const targetLocale = 'en';

    const newPath = `/${targetLocale}${pathname}`;
    const url = new URL(newPath, request.url);
    url.search = request.nextUrl.search;

    return NextResponse.redirect(url);
  }

  // ==============================
  // ✅ 2. Dynamic Redirects (Cached)
  // ==============================
  try {
    const backendUrl =
      process.env.BACKEND_URL ||
      'https://api01-khansaheb.e8demo.com';

    const redirects = await getRedirects(backendUrl);

    if (redirects.length) {
      const normalizedPath =
        pathname.endsWith('/') && pathname !== '/'
          ? pathname.slice(0, -1)
          : pathname;

      const localePrefix =
        locale && locale !== 'default' ? `/${locale}` : '';

      const currentPath = normalizedPath || '/';

      const currentPathWithLocale =
        localePrefix && !normalizedPath.startsWith(localePrefix)
          ? normalizedPath === '/'
            ? localePrefix
            : `${localePrefix}${normalizedPath}`
          : normalizedPath || '/';

      for (const redirect of redirects) {
        if (!redirect?.source_url || !redirect?.target_url) continue;
        if (redirect.status !== 'enabled') continue;
        if (redirect.group_name !== 'redirections') continue;

        // ------------------------------
        // Normalize SOURCE
        // ------------------------------
        let sourcePath = String(redirect.source_url).trim();

        if (sourcePath.startsWith('http')) {
          try {
            sourcePath = new URL(sourcePath).pathname;
          } catch {}
        }

        if (!sourcePath.startsWith('/')) sourcePath = '/' + sourcePath;
        if (sourcePath.endsWith('/') && sourcePath !== '/')
          sourcePath = sourcePath.slice(0, -1);

        // ------------------------------
        // Normalize TARGET
        // ------------------------------
        let targetPath = String(redirect.target_url).trim();

        if (targetPath.startsWith('http')) {
          try {
            targetPath = new URL(targetPath).pathname;
          } catch {}
        }

        if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
        if (targetPath.endsWith('/') && targetPath !== '/')
          targetPath = targetPath.slice(0, -1);

        if (sourcePath === targetPath) continue;

        // ------------------------------
        // Remove locale from source
        // ------------------------------
        let sourceWithoutLocale = sourcePath;

        if (localePrefix) {
          if (sourcePath === localePrefix) {
            sourceWithoutLocale = '/';
          } else if (sourcePath.startsWith(`${localePrefix}/`)) {
            sourceWithoutLocale = sourcePath.slice(localePrefix.length);
            if (!sourceWithoutLocale) sourceWithoutLocale = '/';
          }
        }

        // ------------------------------
        // Matching logic
        // ------------------------------
        const isMatch =
          currentPath === sourcePath ||
          currentPath === sourceWithoutLocale ||
          currentPathWithLocale === sourcePath;

        if (isMatch) {
          const statusCode = parseInt(redirect.action_code, 10);
          const redirectStatus = [301, 302, 307, 308].includes(statusCode)
            ? statusCode
            : 307;

          // ✅ Safe URL handling
          const targetUrl = redirect.target_url.startsWith('http')
            ? redirect.target_url
            : new URL(redirect.target_url, request.url).toString();

          // 🔥 Fire & forget hit tracking
          fetch(`${backendUrl}/wp-json/crm/v1/hit/${redirect.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: request.url,
              referrer: request.headers.get('referer') || '',
              ip:
                (request.headers.get('x-forwarded-for') ||
                  request.ip ||
                  '').split(',')[0],
            }),
          }).catch(() => {});

          return NextResponse.redirect(targetUrl, redirectStatus);
        }
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
  }

  // ==============================
  // ✅ 3. Continue request
  // ==============================
  return NextResponse.next();
}

// ==============================
// ✅ Matcher (optimized)
// ==============================
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|static|.*\\..*).*)',
  ],
};
