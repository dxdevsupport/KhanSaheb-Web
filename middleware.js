import { NextResponse } from 'next/server';

export async function middleware(request) {
  const { pathname, locale } = request.nextUrl;

  // console.log(`[Middleware] Path: ${pathname}, Locale: ${locale}, URL: ${request.url}`);

  // 1. Enforce 'en' prefix for default locale
  // If the detected locale is 'default', it means the user accessed a path without a locale prefix (e.g., / or /about)
  // We want to redirect these to /en (e.g., /en or /en/about)
  if (locale === 'default') {
    const targetLocale = 'en';
    
    // Construct the new URL
    // request.nextUrl.pathname includes the path WITHOUT the locale prefix (Next.js normalizes it)
    // So for '/', pathname is '/'. For '/about', pathname is '/about'.
    const newPath = `/${targetLocale}${pathname}`;
    
    const url = new URL(newPath, request.url);
    url.search = request.nextUrl.search; // Preserve query params
    
    // console.log(`[Middleware] Redirecting 'default' locale to: ${url.toString()}`);
    return NextResponse.redirect(url);
  }

  // 2. Custom Redirection Manager Logic
  // Only run if not redirecting for locale
  try {
    const backendUrl = process.env.BACKEND_URL || 'https://api01-khansaheb.e8demo.com';
    const apiUrl = `${backendUrl}/wp-json/crm/v1/redirects`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 }
    });

    if (response.ok) {
      const redirects = await response.json(); 
      if (Array.isArray(redirects)) {
        const normalizedPathname = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
        const localePrefix = locale && locale !== 'default' ? `/${locale}` : '';
        const currentPath = normalizedPathname || '/';
        const currentPathWithLocale =
          localePrefix && !normalizedPathname.startsWith(localePrefix)
            ? normalizedPathname === '/' ? localePrefix : `${localePrefix}${normalizedPathname}`
            : normalizedPathname || '/';

        for (const redirect of redirects) {
          if (!redirect || !redirect.source_url || !redirect.target_url) continue;
          if (redirect.status && redirect.status !== 'enabled') continue;
          if (redirect.group_name && redirect.group_name !== 'redirections') continue;

          let sourcePath = String(redirect.source_url).trim();

          if (sourcePath.startsWith('http')) {
            try {
              sourcePath = new URL(sourcePath).pathname;
            } catch (e) {}
          }

          if (!sourcePath.startsWith('/')) sourcePath = '/' + sourcePath;
          if (sourcePath.endsWith('/') && sourcePath !== '/') sourcePath = sourcePath.slice(0, -1);

          let targetPath = String(redirect.target_url).trim();

          if (targetPath.startsWith('http')) {
            try {
              targetPath = new URL(targetPath).pathname;
            } catch (e) {}
          }

          if (!targetPath.startsWith('/')) targetPath = '/' + targetPath;
          if (targetPath.endsWith('/') && targetPath !== '/') targetPath = targetPath.slice(0, -1);

          const normalizedSource = sourcePath || '/';
          const normalizedTarget = targetPath || '/';
          if (normalizedSource === normalizedTarget) continue;

          let sourceWithoutLocale = normalizedSource;

          if (localePrefix) {
            if (normalizedSource === localePrefix) {
              sourceWithoutLocale = '/';
            } else if (normalizedSource.startsWith(`${localePrefix}/`)) {
              sourceWithoutLocale = normalizedSource.slice(localePrefix.length);
              if (sourceWithoutLocale === '') sourceWithoutLocale = '/';
            }
          }

          const isMatch =
            currentPath === normalizedSource ||
            currentPath === sourceWithoutLocale ||
            currentPathWithLocale === normalizedSource;

          if (isMatch) {
            const statusCode = parseInt(redirect.action_code, 10);
            const redirectStatus = [301, 302, 307, 308].includes(statusCode) ? statusCode : 307;

            fetch(`${backendUrl}/wp-json/crm/v1/hit/${redirect.id}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                url: request.url,
                referrer: request.headers.get('referer') || '',
                ip: (request.headers.get('x-forwarded-for') || request.ip || '').split(',')[0]
              })
            }).catch(err => console.error('Hit record error:', err));

            return NextResponse.redirect(new URL(redirect.target_url, request.url), redirectStatus);
          }
        }
      }
    }
  } catch (error) {
    console.error('Middleware redirect error:', error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static (public static files if any)
     * - files with extensions (e.g. .css, .js, .png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|static|.*\\..*).*)',
  ],
};
