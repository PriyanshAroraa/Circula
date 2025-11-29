import React, { useEffect } from 'react';
import { supabase } from '../../services/supabase';

const AuthCallback: React.FC = () => {
  useEffect(() => {
    // Supabase automatically handles the OAuth callback via detectSessionInUrl
    // Wait a moment for the session to be processed, then redirect
    const handleCallback = async () => {
      try {
        // Give Supabase a moment to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we have a session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Clear the callback URL and redirect to home
          window.history.replaceState({}, '', '/');
          window.location.href = '/';
        } else {
          // No session, redirect anyway (user can try again)
          window.location.href = '/';
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        window.location.href = '/';
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-neutral-400">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;

