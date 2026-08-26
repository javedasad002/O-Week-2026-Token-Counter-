import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, pass: string) => Promise<void>;
}

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps): React.ReactElement | null {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 border border-[#B6CDD8]/50">
        <h3 className="text-lg font-bold text-[#0B3D5C] mb-1">Staff Authentication</h3>
        <p className="text-xs text-[#5C63A5] mb-4">
          Please log in with your staff account to modify token counts.
        </p>

        {error && (
          <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#0B3D5C] mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@oweek.edu"
              className="w-full px-3 py-2 border border-[#B6CDD8] rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4A3A8C]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0B3D5C] mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-[#B6CDD8] rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#4A3A8C]"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-bold text-[#5C63A5] hover:bg-[#EEF1F2] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 text-xs font-bold bg-[#4A3A8C] hover:bg-[#471F73] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
