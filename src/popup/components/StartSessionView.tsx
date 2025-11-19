import { useState } from 'react';
import type { Stats, AIConfig, UserSettings } from '../../services/types';

interface Props {
  onStart: (intent: string) => void;
  stats: Stats | null;
  aiConfig: AIConfig | null;
  settings: UserSettings | null;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  sessionStarting: boolean;
}

export default function StartSessionView({ onStart, stats, aiConfig, settings, onUpdateSettings, sessionStarting }: Props) {
  const [intent, setIntent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!intent.trim()) {
      alert('Please enter what you want to focus on');
      return;
    }
    
    if (!aiConfig || !aiConfig.apiKey) {
      alert('Please configure your AI API key in settings first');
      return;
    }

    if (settings && !settings.dataSharingConsent) {
      alert('Please consent to sending URLs to OpenAI before starting.');
      return;
    }

    if (settings && !settings.aiEnabled) {
      alert('AI filtering is disabled. Enable it in Settings.');
      return;
    }
    
    await onStart(intent);
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          What do you want to focus on?
        </h2>
        <p className="text-gray-600 text-sm">
          AI will help you stay focused by blocking distractions
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="I want to learn React and build a web app..."
            className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all resize-none"
            disabled={sessionStarting}
          />
        </div>
        
        <button
          type="submit"
          disabled={
            sessionStarting ||
            !intent.trim() ||
            !aiConfig?.apiKey ||
            (settings ? !settings.dataSharingConsent || !settings.aiEnabled : true)
          }
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {sessionStarting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Starting Focus Mode...
            </span>
          ) : (
            '🎯 Start Focus Mode'
          )}
        </button>
      </form>

      {/* Consent */}
      {settings && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100 space-y-3">
          <div className="flex items-start space-x-3">
            <input
              id="consent-checkbox"
              type="checkbox"
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={settings.dataSharingConsent}
              onChange={(e) => onUpdateSettings({
                dataSharingConsent: e.target.checked,
                aiEnabled: e.target.checked ? settings.aiEnabled : false,
              })}
            />
            <label htmlFor="consent-checkbox" className="text-sm text-gray-700">
              I understand that DoOneThing will send the URLs and titles of the pages I visit,
              along with my focus goal, to OpenAI to determine whether a site should be blocked.
              This is required for AI-powered filtering.
            </label>
          </div>
          <p className="text-xs text-gray-500">
            Review our{' '}
            <a
              href="https://github.com/VellerRider/Do-One-Thing/blob/main/PRIVACY_POLICY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </a>{' '}
            for details about data usage.
          </p>
        </div>
      )}

      {/* Stats */}
      {stats && stats.sessionsCompleted > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Progress</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.sessionsCompleted}</div>
              <div className="text-xs text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalBlocked}</div>
              <div className="text-xs text-gray-600">Blocked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(stats.totalFocusTime / 3600000)}h
              </div>
              <div className="text-xs text-gray-600">Focused</div>
            </div>
          </div>
        </div>
      )}

      {/* AI Warning */}
      {(!aiConfig || !aiConfig.apiKey || (settings && (!settings.aiEnabled || !settings.dataSharingConsent))) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm">
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2">⚠️</span>
            <div>
              <p className="font-semibold text-yellow-800 mb-1">AI Configuration Required</p>
              <p className="text-yellow-700">
                Please configure your OpenAI API key, enable AI filtering, and consent to sending URLs to OpenAI in Settings.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
