import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface Agent {
  id: string;
  agent_id: string;
  name: string;
  created_at: string;
}

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

interface InstalledSkill {
  id: string;
  skill_id: string;
  skill_name: string;
  installed_at: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [_user, setUser] = useState<any>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [installedSkills, setInstalledSkills] = useState<InstalledSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuth();
    fetchAvailableSkills();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }

      setUser(user);

      // Fetch user's agent
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (agentError) {
        console.error('Agent fetch error:', agentError);
      } else {
        setAgent(agentData);
        fetchInstalledSkills(agentData.id);
      }
    } catch (err: any) {
      console.error('Auth check error:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSkills = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'https://zero-agent-backend-production.up.railway.app';
      const response = await fetch(`${backendUrl}/api/skills`);
      const data = await response.json();
      setAvailableSkills(data.skills || []);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    }
  };

  const fetchInstalledSkills = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_skills')
        .select('*')
        .eq('agent_id', agentId)
        .order('installed_at', { ascending: false });

      if (error) throw error;
      setInstalledSkills(data || []);
    } catch (err) {
      console.error('Failed to fetch installed skills:', err);
    }
  };

  const installSkill = async (skill: Skill) => {
    if (!agent) return;

    try {
      const { error } = await supabase
        .from('agent_skills')
        .insert({
          agent_id: agent.id,
          skill_id: skill.id,
          skill_name: skill.name,
        });

      if (error) {
        if (error.code === '23505') {
          alert('Skill already installed!');
        } else {
          throw error;
        }
      } else {
        alert(`${skill.name} installed successfully!`);
        fetchInstalledSkills(agent.id);
      }
    } catch (err: any) {
      console.error('Install error:', err);
      alert('Failed to install skill');
    }
  };

  const uninstallSkill = async (skillId: string, skillName: string) => {
    if (!agent) return;

    if (!confirm(`Are you sure you want to uninstall ${skillName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('agent_skills')
        .delete()
        .eq('id', skillId);

      if (error) throw error;

      alert(`${skillName} uninstalled successfully!`);
      fetchInstalledSkills(agent.id);
    } catch (err) {
      console.error('Uninstall error:', err);
      alert('Failed to uninstall skill');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ZERO AGENT</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Agent Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Agent</h2>
          {agent ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Agent ID:</span>
                <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                  {agent.agent_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{agent.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-sm">
                  {new Date(agent.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No agent found</p>
          )}
        </div>

        {/* Installed Skills */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Installed Skills ({installedSkills.length})
            </h2>
            <button
              onClick={() => setShowSkillsModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Skills
            </button>
          </div>

          {installedSkills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {installedSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {skill.skill_name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Installed {new Date(skill.installed_at).toLocaleDateString()}
                  </p>
                  <button
                    onClick={() => uninstallSkill(skill.id, skill.skill_name)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Uninstall
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No skills installed yet</p>
              <button
                onClick={() => setShowSkillsModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Install Your First Skill
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  Available Skills
                </h2>
                <button
                  onClick={() => setShowSkillsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableSkills.map((skill) => {
                  const isInstalled = installedSkills.some(
                    (installed) => installed.skill_id === skill.id
                  );

                  return (
                    <div
                      key={skill.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{skill.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {skill.name}
                            </h3>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {skill.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {skill.description}
                      </p>
                      <button
                        onClick={() => installSkill(skill)}
                        disabled={isInstalled}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                          isInstalled
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isInstalled ? 'Installed' : 'Install Skill'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
