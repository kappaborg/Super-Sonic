import { setSecurityHeaders } from '@/lib/security';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { withAuth } from 'next-auth/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Middleware, her istekte Supabase oturumlarını yenileyecek şekilde çalışır
 * Ayrıca korumalı rotalara izinsiz erişimlerden korunmak için kullanılır
 * Güvenlik headerlarını tüm isteklere uygular
 */
export async function middleware(req: NextRequest) {
  let res = NextResponse.next();
  
  // Supabase istemcisini middleware'de oluştur
  const supabase = createMiddlewareClient({ req, res });
  
  // Oturumu yenile
  const { data: { session } } = await supabase.auth.getSession();
  
  // Korumalı rotaları kontrol et
  const path = req.nextUrl.pathname;
  const isAuthPage = path.startsWith('/auth');
  const isApiRoute = path.startsWith('/api') && !path.startsWith('/api/public');
  const isDashboardRoute = path.startsWith('/dashboard');
  const isMeetingRoute = path.startsWith('/meetings');
  const isStaticRoute = path.startsWith('/_next') || 
                        path.startsWith('/static') || 
                        path === '/favicon.ico' || 
                        path === '/robots.txt' ||
                        path === '/manifest.json' ||
                        path === '/sitemap.xml';
  
  if (isAuthPage || isApiRoute || isDashboardRoute || isMeetingRoute) {
    // Oturum yoksa ve korumalı rotadaysa giriş sayfasına yönlendir
    if (!session && !isAuthPage) {
      const redirectUrl = new URL('/auth/login', req.url);
      redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Oturum varsa ve auth sayfasındaysa dashboard'a yönlendir
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  // API istekleri için CORS ayarları
  if (isApiRoute) {
    res.headers.set('Access-Control-Allow-Credentials', 'true');
    res.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    res.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    
    // Preflight OPTIONS isteklerini ele al
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: res.headers });
    }
  }
  
  // Statik dosyalar hariç diğer tüm istekler için güvenlik headerlarını ayarla
  if (!isStaticRoute) {
    res = setSecurityHeaders(req, res);
  }
  
  return res;
}

export default withAuth(
  function middleware(req) {
    // Add CORS headers if needed
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Add security headers
    return setSecurityHeaders(req, response);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Combined matchers for both security and auth protection
export const config = {
  matcher: [
    // Security headers for all routes except static assets
    '/((?!_next/static|_next/image|favicon.ico).*)',
    // Auth protection for API and meeting routes
    '/api/:path*',
    '/meeting/:path*'
  ],
}; 