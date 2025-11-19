import { useState, useEffect } from 'react';
import type { FocusSession, Stats, UserSettings, AIConfig } from '../services/types';
import StartSessionView from './components/StartSessionView';
import ActiveSessionView from './components/ActiveSessionView';
import SettingsView from './components/SettingsView';

export default function App() {
  const [view, setView] = useState<'start' | 'active' | 'settings'>('start');
  const [previousView, setPreviousView] = useState<'start' | 'active'>('start');
  const [session, setSession] = useState<FocusSession | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStarting, setSessionStarting] = useState(false);

  useEffect(() => {
    loadData();
    
    let mounted = true;
    
    const loadSessionStarting = async () => {
      try {
        const data = await chrome.storage.local.get('sessionStarting');
        if (mounted) {
          setSessionStarting(Boolean(data.sessionStarting));
        }
      } catch (error) {
        console.error('Failed to load sessionStarting state:', error);
      }
    };
    
    loadSessionStarting();
    
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName !== 'local') return;
      if (changes.sessionStarting) {
        setSessionStarting(Boolean(changes.sessionStarting.newValue));
      }
    };
    
    chrome.storage.onChanged.addListener(handleStorageChange);
    
    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATS' });
      
      if (response.success) {
        setSession(response.session);
        setStats(response.stats);
        setSettings(response.settings);
        
        if (response.session?.active) {
          setView('active');
        }
      }
      
      // Load AI config
      const aiConfigData = await chrome.storage.local.get('aiConfig');
      setAIConfig(aiConfigData.aiConfig || null);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (intent: string) => {
    if (sessionStarting) return;
    
    setSessionStarting(true);
    await chrome.storage.local.set({ sessionStarting: true });
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'START_SESSION',
        payload: { intent },
      });
      
      if (response.success) {
        setSession(response.session);
        setView('active');
        setPreviousView('active');
        
      } else {
        alert(`Failed to start session: ${response.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      await chrome.storage.local.set({ sessionStarting: false });
      setSessionStarting(false);
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'END_SESSION' });
      
      if (response.success) {
        setSession(null);
        setView('start');
        setPreviousView('start');
        await loadData();
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        payload: newSettings,
      });
      
      await loadData();
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const handleSaveAIConfig = async (config: AIConfig) => {
    try {
      await chrome.storage.local.set({ aiConfig: config });
      setAIConfig(config);
      
      // Notify background to reinitialize AI service
      await chrome.runtime.sendMessage({ type: 'RELOAD_AI_CONFIG' });
    } catch (error) {
      console.error('Failed to save AI config:', error);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="animate-pulse-slow">
          <div className="text-4xl mb-2">🎯</div>
          <div className="text-sm text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-xl font-bold text-gray-800">DoOneThing</h1>
        </div>
        
        <button
          onClick={() => {
            if (view === 'settings') {
              setView(previousView);
            } else {
              setPreviousView(view as 'start' | 'active');
              setView('settings');
            }
          }}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {view === 'settings' ? '←' : '⚙️'}
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {view === 'start' && (
          <StartSessionView
            onStart={handleStartSession}
            stats={stats}
            aiConfig={aiConfig}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            sessionStarting={sessionStarting}
          />
        )}
        
        {view === 'active' && session && (
          <ActiveSessionView
            session={session}
            stats={stats}
            onEnd={handleEndSession}
          />
        )}
        
        {view === 'settings' && settings && (
          <SettingsView
            settings={settings}
            aiConfig={aiConfig}
            onUpdateSettings={handleUpdateSettings}
            onSaveAIConfig={handleSaveAIConfig}
          />
        )}
      </div>
    </div>
  );
}
