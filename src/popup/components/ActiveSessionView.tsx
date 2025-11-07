import { useState, useEffect } from 'react';
import type { FocusSession, Stats } from '../../services/types';
import { formatDuration } from '../../utils/helpers';

interface Props {
  session: FocusSession;
  stats: Stats | null;
  onEnd: () => void;
}

export default function ActiveSessionView({ session, stats, onEnd }: Props) {
  const [elapsed, setElapsed] = useState(Date.now() - session.startTime);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - session.startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [session.startTime]);

  const handleEndSession = () => {
    if (showEndConfirm) {
      onEnd();
    } else {
      setShowEndConfirm(true);
      setTimeout(() => setShowEndConfirm(false), 3000);
    }
  };

  const topBlockedSites = stats?.websitesBlocked 
    ? Object.entries(stats.websitesBlocked)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  return (
    <div className="space-y-6">
      {/* Active Status */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-pulse-slow">🎯</span>
            <span className="text-sm font-semibold uppercase tracking-wide">Focus Mode Active</span>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
            {formatDuration(elapsed)}
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-1">
          {session.intent}
        </h2>
        
        <div className="flex items-center space-x-4 text-sm opacity-90">
          <span>🚫 {session.blockedCount || 0} blocked</span>
          <span>📋 {session.rules.keywords.length} keywords</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-3xl font-bold text-red-600">
            {session.blockedCount || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Sites Blocked</div>
          <div className="text-xs text-gray-500 mt-1">This session</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {formatDuration(elapsed)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Focus Time</div>
          <div className="text-xs text-gray-500 mt-1">Keep going!</div>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">🔑 Active Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {session.rules.keywords.slice(0, 10).map((keyword, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
            >
              {keyword}
            </span>
          ))}
          {session.rules.keywords.length > 10 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{session.rules.keywords.length - 10} more
            </span>
          )}
        </div>
      </div>

      {/* Blocked Sites */}
      {topBlockedSites.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🚫 Most Blocked</h3>
          <div className="space-y-2">
            {topBlockedSites.map(([domain, count]) => (
              <div key={domain} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 truncate flex-1">{domain}</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                  {count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Allowed Domains Preview */}
      {session.rules.allowedDomains.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">✅ Allowed Sites</h3>
          <div className="flex flex-wrap gap-2">
            {session.rules.allowedDomains.slice(0, 5).map((domain, index) => (
              <span 
                key={index}
                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
              >
                {domain}
              </span>
            ))}
            {session.rules.allowedDomains.length > 5 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{session.rules.allowedDomains.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* End Session Button */}
      <button
        onClick={handleEndSession}
        className={`w-full font-semibold py-3 px-6 rounded-xl transition-all transform ${
          showEndConfirm
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {showEndConfirm ? '⚠️ Click again to confirm' : '⏹️ End Focus Session'}
      </button>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <div className="flex items-start">
          <span className="text-blue-500 mr-2">💡</span>
          <div className="text-blue-800">
            <p className="font-semibold mb-1">Stay focused!</p>
            <p className="text-blue-700 text-xs">
              Distracting websites will be automatically blocked. 
              You can always end the session when you're done.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
