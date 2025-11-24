/**
 * Mock Authentication Utility
 * Backend bağımlılığı olmadan authentication işlemlerini simüle eder
 */

/**
 * Mock JWT token oluştur (basit base64 encoding)
 */
export function createMockToken(payload: {
  id: string;
  email: string;
  tenantId?: string;
  role?: string;
  type?: 'platform_admin' | 'tenant_user';
}): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 saat
  };

  // Basit base64 encoding (gerçek JWT değil, sadece mock)
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(tokenPayload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.mock-secret`);

  return `mock-token-${payload.id}`;
}

/**
 * Mock token'ı decode et
 */
export function decodeMockToken(token: string): any | null {
  try {
    // Mock token formatı: mock-token-{id}
    if (token.startsWith('mock-token-')) {
      const id = token.replace('mock-token-', '');
      
      // Token'dan user bilgilerini localStorage'dan al
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
          role: user.role,
          type: user.isPlatformAdmin ? 'platform_admin' : 'tenant_user',
        };
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Token'ın geçerli olup olmadığını kontrol et
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  
  // Mock token'lar her zaman geçerli (localStorage'da user varsa)
  if (token.startsWith('mock-token-')) {
    const userStr = localStorage.getItem('user');
    return !!userStr;
  }
  
  return false;
}

/**
 * Session bilgilerini localStorage'dan al
 */
export function getMockSession(): {
  user: any | null;
  token: string | null;
} {
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  return {
    user: userStr ? JSON.parse(userStr) : null,
    token: token,
  };
}

/**
 * Session'ı temizle
 */
export function clearMockSession(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('tenant');
}

/**
 * Mock password hash (gerçek hash değil, sadece karşılaştırma için)
 */
export function mockPasswordHash(password: string): string {
  // Gerçek hash değil, sadece mock için
  return `mock-hash-${btoa(password)}`;
}

/**
 * Mock password verify
 */
export function mockPasswordVerify(password: string, hash: string): boolean {
  // Mock password'lar için basit kontrol
  // Gerçek uygulamada bcrypt kullanılır
  if (password === 'password123' || password === 'admin123') {
    return true;
  }
  
  // Hash'ten password'u çıkar (mock için)
  try {
    const decoded = atob(hash.replace('mock-hash-', ''));
    return decoded === password;
  } catch {
    return false;
  }
}

