'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function ConfirmContent() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Supabase email confirmation flow:
    // 1. User clicks link: https://supabase.co/auth/v1/verify?token=xxx&type=signup&redirect_to=...
    // 2. Supabase verifies the token
    // 3. Supabase redirects to redirect_to with session tokens in hash: #access_token=xxx&token_type=bearer&...
    // OR with errors in query params: ?error=access_denied&error_description=...
    
    if (typeof window === 'undefined') return
    
    // Check for errors first - Supabase redirects with error params if verification fails
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const errorCode = searchParams.get('error_code')
    
    if (error) {
      console.error('❌ Supabase error:', error, errorDescription, errorCode)
      const message = document.getElementById('message')
      if (message) {
        const friendlyMessage = errorCode === 'otp_expired' 
          ? 'The confirmation link has expired. Please request a new confirmation email.'
          : errorDescription || 'An error occurred during email confirmation.'
        
        message.innerHTML = `
          <h1 style="color: red; margin-bottom: 20px;">Email Confirmation Failed</h1>
          <p style="color: #666; margin-bottom: 20px;">${friendlyMessage}</p>
          <p style="font-size: 12px; color: #999; margin-top: 20px;">
            Error: ${error}<br/>
            ${errorCode ? `Code: ${errorCode}` : ''}
          </p>
          <a href="/signup" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #007AFF; color: white; text-decoration: none; border-radius: 8px;">Go to Sign Up</a>
        `
      }
      return // Don't try to redirect if there's an error
    }
    
    // Priority 1: Check hash for access_token (Supabase already verified)
    // This is the most common case after Supabase verifies the token
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      
      if (accessToken) {
        // Supabase already verified - redirect to app with session tokens
        const refreshToken = hashParams.get('refresh_token') || ''
        const expiresIn = hashParams.get('expires_in') || '3600'
        const tokenType = hashParams.get('token_type') || 'bearer'
        
        const deepLink = `personalfinance://auth/callback#access_token=${encodeURIComponent(accessToken)}&token_type=${tokenType}&expires_in=${expiresIn}${refreshToken ? `&refresh_token=${encodeURIComponent(refreshToken)}` : ''}`
        
        console.log('✅ Supabase verified, redirecting to app with session tokens')
        console.log('Deep link:', deepLink)
        
        // Redirect immediately
        window.location.href = deepLink
        return
      }
    }
    
    // Priority 2: Check for authorization code (Supabase PKCE flow)
    // Supabase sometimes redirects with a code that needs to be exchanged for tokens
    const code = searchParams.get('code')
    
    if (code) {
      console.log('✅ Found authorization code, redirecting to app for token exchange')
      // Pass the code to the app - it will exchange it for tokens
      const deepLink = `personalfinance://auth/callback?code=${encodeURIComponent(code)}`
      
      console.log('Redirecting to app with authorization code:', deepLink)
      
      // Try to open the app immediately
      window.location.href = deepLink
      
      // Fallback: Show message if app doesn't open
      setTimeout(() => {
        const message = document.getElementById('message')
        if (message) {
          message.innerHTML = `
            <h1 style="margin-bottom: 20px;">Email Confirmed! ✅</h1>
            <p style="color: #666; margin-bottom: 20px;">If the app didn't open automatically, tap the button below:</p>
            <a href="${deepLink}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #007AFF; color: white; text-decoration: none; border-radius: 8px;">Open Personal Finance App</a>
          `
        }
      }, 2000)
      return
    }
    
    // Priority 3: Check query parameters for token (before Supabase verification)
    // This happens if the user lands here directly with the token
    let token: string | null = null
    let type: string | null = null
    
    token = searchParams.get('token')
    type = searchParams.get('type')
    
    // Also check hash for token (less common)
    if (!token && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      token = hashParams.get('token')
      type = hashParams.get('type') || 'email'
    }
    
    console.log('Token extracted:', token ? 'present' : 'missing', 'Type:', type || 'none')
    console.log('Full URL:', window.location.href)
    console.log('Hash:', window.location.hash || 'none')
    console.log('Query:', window.location.search || 'none')
    
    if (token) {
      // Construct the deep link URL with the OTP token (app will verify it)
      const deepLink = `personalfinance://auth/callback?token=${encodeURIComponent(token)}${type ? `&type=${encodeURIComponent(type)}` : '&type=email'}`
      
      console.log('Redirecting to app with OTP token:', deepLink)
      
      // Try to open the app immediately
      window.location.href = deepLink
      
      // Fallback: Show message if app doesn't open
      setTimeout(() => {
        // If we're still here after 2 seconds, show instructions
        const message = document.getElementById('message')
        if (message) {
          message.innerHTML = `
            <p>If the app didn't open automatically, please:</p>
            <ol>
              <li>Make sure you have the Personal Finance app installed</li>
              <li>Tap the button below to try again</li>
            </ol>
            <a href="${deepLink}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #007AFF; color: white; text-decoration: none; border-radius: 8px;">Open App</a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">Debug: Token found: ${token ? 'Yes' : 'No'}</p>
          `
        }
      }, 2000)
    } else {
      // Show debug info
      const debugInfo = typeof window !== 'undefined' ? `
        <p style="font-size: 12px; color: #666; margin-top: 10px;">
          Debug Info:<br/>
          URL: ${window.location.href}<br/>
          Hash: ${window.location.hash || 'none'}<br/>
          Query: ${window.location.search || 'none'}
        </p>
      ` : ''
      
      document.getElementById('message')!.innerHTML = `
        <p style="color: red;">Error: No token found in the confirmation link.</p>
        <p>This might mean:</p>
        <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
          <li>The link has expired</li>
          <li>The link format is incorrect</li>
          <li>Supabase redirected here without the token</li>
        </ul>
        ${debugInfo}
        <p style="margin-top: 20px;">Please request a new confirmation email.</p>
      `
    }
  }, [searchParams])
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div id="message" style={{ textAlign: 'center', maxWidth: '400px' }}>
        <h1 style={{ marginBottom: '20px' }}>Confirming your email...</h1>
        <p>Opening the Personal Finance app...</p>
        <div style={{ marginTop: '20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007AFF',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  )
}

