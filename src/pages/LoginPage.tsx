import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Helper function to create agent with retry logic
  const createAgentWithRetry = async (userId: string, userEmail: string, maxRetries = 3) => {
    let retries = maxRetries;
    
    while (retries > 0) {
      try {
        // Generate unique Agent ID
        const agentId = `AGENT_${Date.now()}_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        
        const { error: agentError } = await supabase
          .from('agents')
          .insert({
            user_id: userId,
            agent_id: agentId,
            name: `${userEmail.split('@')[0]}'s Agent`,
          });

        if (!agentError) {
          console.log('✅ Agent created successfully:', agentId);
          return { success: true, agentId };
        }

        // If error is duplicate, agent already exists - that's OK
        if (agentError.code === '23505') {
          console.log('ℹ️ Agent already exists for this user');
          return { success: true, agentId: null };
        }

        // If it's a different error, retry
        console.warn(`Agent creation attempt failed, retries left: ${retries - 1}`, agentError);
        retries--;
        
        // Wait before retrying (exponential backoff)
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (maxRetries - retries + 1)));
        }
      } catch (err) {
        console.error('Agent creation error:', err);
        retries--;
        
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (maxRetries - retries + 1)));
        }
      }
    }

    // If all retries failed, return error but don't block login
    console.error('❌ Agent creation failed after all retries');
    return { success: false, agentId: null };
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignup) {
        // Sign up new user
        const { data, error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signupError) throw signupError;

        if (data.user) {
          setSuccess('Account created! Setting up your agent...');

          // Try to create agent (with retries)
          const agentResult = await createAgentWithRetry(data.user.id, email);

          if (agentResult.success) {
            setSuccess('Account created! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1500);
          } else {
            // Agent creation failed but user was created
            setSuccess('Account created! Redirecting... (Agent setup pending)');
            setTimeout(() => navigate('/dashboard'), 1500);
          }
        }
      } else {
        // Sign in existing user
        const { error: signinError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signinError) throw signinError;

        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">ZERO AGENT</h1>
          <p className="text-gray-600">
            {isSignup ? 'Create your AI agent account' : 'Welcome back'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
            {isSignup && (
              <p className="text-xs text-gray-500 mt-1">
                Minimum 6 characters
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isSignup ? 'Creating account...' : 'Signing in...'}
              </span>
            ) : (
              <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setSuccess('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
            disabled={loading}
          >
            {isSignup
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          <p>Powered by ZERO AGENT OS</p>
          <p className="mt-1">Full-stack AI Agent Infrastructure</p>
        </div>
      </div>
    </div>
  );
}
