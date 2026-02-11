export default function DashboardPage({ userEmail, onLogout }: { userEmail: string; onLogout: () => void }) {
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
