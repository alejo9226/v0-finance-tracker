'use client'

import { useEffect, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function ConfirmContent() {
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Extract token and type from URL parameters
    const token = searchParams.get('token')
    const type = searchParams.get('type')
    
    if (token) {
      // Construct the deep link URL with the token
      const deepLink = `personalfinance://auth/callback?token=${encodeURIComponent(token)}${type ? `&type=${encodeURIComponent(type)}` : '&type=email'}`
      
      console.log('Redirecting to app with deep link:', deepLink)
      
      // Try to open the app
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
          `
        }
      }, 2000)
    } else {
      document.getElementById('message')!.innerHTML = '<p style="color: red;">Error: No token found in the confirmation link.</p>'
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

