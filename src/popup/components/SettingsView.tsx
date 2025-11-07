import { useState } from 'react';
import type { UserSettings, AIConfig } from '../../services/types';

interface Props {
  settings: UserSettings;
  aiConfig: AIConfig | null;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onSaveAIConfig: (config: AIConfig) => void;
}

export default function SettingsView({ settings, aiConfig, onUpdateSettings, onSaveAIConfig }: Props) {
  const [activeTab, setActiveTab] = useState<'ai' | 'rules' | 'data'>('ai');
  const [apiKey, setApiKey] = useState(aiConfig?.apiKey || '');
  const [provider, setProvider] = useState(aiConfig?.provider || 'openai');
  const [model, setModel] = useState(aiConfig?.model || 'gpt-4o-mini');
  const [whitelistInput, setWhitelistInput] = useState('');
  const [blacklistInput, setBlacklistInput] = useState('');

  const handleSaveAIConfig = () => {
    if (!apiKey.trim()) {
      alert('Please enter an API key');
      return;
    }

    onSaveAIConfig({
      provider,
      apiKey: apiKey.trim(),
      model,
      enabled: true,
    });

    alert('AI configuration saved!');
  };

  const handleAddToWhitelist = () => {
    if (whitelistInput.trim()) {
      const newWhitelist = [...settings.whitelist, whitelistInput.trim()];
      onUpdateSettings({ whitelist: newWhitelist });
      setWhitelistInput('');
    }
  };

  const handleRemoveFromWhitelist = (domain: string) => {
    const newWhitelist = settings.whitelist.filter(d => d !== domain);
    onUpdateSettings({ whitelist: newWhitelist });
  };

  const handleAddToBlacklist = () => {
    if (blacklistInput.trim()) {
      const newBlacklist = [...settings.blacklist, blacklistInput.trim()];
      onUpdateSettings({ blacklist: newBlacklist });
      setBlacklistInput('');
    }
  };

  const handleRemoveFromBlacklist = (domain: string) => {
    const newBlacklist = settings.blacklist.filter(d => d !== domain);
    onUpdateSettings({ blacklist: newBlacklist });
  };

  const handleExportData = async () => {
    try {
      const data = await chrome.storage.local.get(null);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `doonething-backup-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const handleClearCache = async () => {
    if (confirm('Clear all cached URL classifications?')) {
      await chrome.runtime.sendMessage({ type: 'CLEAR_CACHE' });
      alert('Cache cleared!');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'ai'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🤖 AI Config
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'rules'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📋 Rules
        </button>
        <button
          onClick={() => setActiveTab('data')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'data'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          💾 Data
        </button>
      </div>

      {/* AI Config Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'openai')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="openai">OpenAI</option>
              <option value="claude" disabled>Claude (Coming Soon)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Recommended)</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <button
            onClick={handleSaveAIConfig}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            💾 Save AI Configuration
          </button>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Strictness Level
            </label>
            <div className="space-y-2">
              {(['relaxed', 'standard', 'strict'] as const).map((level) => (
                <label key={level} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="strictness"
                    checked={settings.strictness === level}
                    onChange={() => onUpdateSettings({ strictness: level })}
                    className="text-blue-600"
                  />
                  <span className="text-sm">
                    {level === 'relaxed' && '😊 Relaxed - More lenient'}
                    {level === 'standard' && '😐 Standard - Balanced'}
                    {level === 'strict' && '😤 Strict - Very focused'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✅ Whitelist (Always Allow)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={whitelistInput}
                onChange={(e) => setWhitelistInput(e.target.value)}
                placeholder="example.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddToWhitelist()}
              />
              <button
                onClick={handleAddToWhitelist}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {settings.whitelist.map((domain) => (
                <div key={domain} className="flex items-center justify-between bg-green-50 px-3 py-2 rounded text-sm">
                  <span className="text-green-800">{domain}</span>
                  <button
                    onClick={() => handleRemoveFromWhitelist(domain)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🚫 Blacklist (Always Block)
            </label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={blacklistInput}
                onChange={(e) => setBlacklistInput(e.target.value)}
                placeholder="distraction.com"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddToBlacklist()}
              />
              <button
                onClick={handleAddToBlacklist}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
              >
                Add
              </button>
            </div>
            <div className="space-y-1">
              {settings.blacklist.map((domain) => (
                <div key={domain} className="flex items-center justify-between bg-red-50 px-3 py-2 rounded text-sm">
                  <span className="text-red-800">{domain}</span>
                  <button
                    onClick={() => handleRemoveFromBlacklist(domain)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <button
            onClick={handleExportData}
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            📥 Export All Data
          </button>

          <button
            onClick={handleClearCache}
            className="w-full bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            🗑️ Clear URL Cache
          </button>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <p className="text-yellow-800">
              <strong>⚠️ Note:</strong> Clearing cache will make AI re-evaluate websites, 
              which may increase API usage temporarily.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
