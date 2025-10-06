// Debug Auth Issues
// This file helps debug authentication problems

export const DEBUG_AUTH = {
  // Check if running in production
  isProduction: process.env.NODE_ENV === 'production',
  
  // Current auth URL
  authUrl: process.env.BETTER_AUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000',
  
  // Log auth attempts
  logAuth: (action: string, success: boolean, error?: unknown) => {
    if (typeof window !== 'undefined') {
      console.log('🔐 Auth Debug:', {
        action,
        success,
        error: error instanceof Error ? error.message : error,
        timestamp: new Date().toISOString(),
        cookies: document.cookie,
      });
    }
  }
};
