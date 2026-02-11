const fs = require('fs');
const path = require('path');

// Simple working version - no complex auth
const files = {
  'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`,
  'src/App.tsx': `import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  return (
    <>
      {isLoggedIn ? (
        <DashboardPage userEmail={userEmail} onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <LoginPage onLogin={(email) => {
          setUserEmail(email);
          setIsLoggedIn(true);
        }} />
      )}
    </>
  );
}
`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`,
  'src/pages/LoginPage.tsx': `import { useState } from 'react';

export default function LoginPage({ onLogin }: { onLogin: (email: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">⚡ ZERO AGENT</h1>
          <p className="text-blue-100">Your personal AI agent, fully in control</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Login</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Demo: Use any email/password to login
          </p>
        </div>
      </div>
    </div>
  );
}
`,
  'src/pages/DashboardPage.tsx': `export default function DashboardPage({ userEmail, onLogout }: { userEmail: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">⚡ ZERO AGENT</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{userEmail}</span>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
          <p className="text-blue-100">Your personal AI agent is ready to automate your work</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="font-bold">Browse Skills</h3>
            <p className="text-sm text-gray-600">Discover new skills</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="text-4xl mb-2">⚙️</div>
            <h3 className="font-bold">Settings</h3>
            <p className="text-sm text-gray-600">Manage your account</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition text-center">
            <div className="text-4xl mb-2">📚</div>
            <h3 className="font-bold">Documentation</h3>
            <p className="text-sm text-gray-600">Learn more</p>
          </div>
        </div>
      </main>
    </div>
  );
}
`,
};

// Create all files
Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(process.cwd(), filePath);
  const dir = path.dirname(fullPath);
  
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Created: ${filePath}`);
});

console.log('\n🎉 Simple version created!');
console.log('Run: npm run dev');
