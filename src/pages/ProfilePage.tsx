import React, { useState } from 'react';
import { useStore } from '../store';
import { User, Plus, X, Pencil, Target } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile } = useStore();
  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [email, setEmail] = useState(profile.email);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [goals, setGoals] = useState<string[]>(profile.goals);
  const [newGoal, setNewGoal] = useState('');

  const handleSave = () => {
    updateProfile({ name, bio, email, avatar, goals });
    setEditing(false);
  };

  const handleCancel = () => {
    setName(profile.name);
    setBio(profile.bio);
    setEmail(profile.email);
    setAvatar(profile.avatar);
    setGoals(profile.goals);
    setEditing(false);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setGoals((prev) => [...prev, newGoal.trim()]);
      setNewGoal('');
    }
  };

  const removeGoal = (idx: number) =>
    setGoals((prev) => prev.filter((_, i) => i !== idx));

  const initials =
    profile.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'YN';

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Pencil size={14} /> Edit
          </button>
        )}
      </div>

      {editing ? (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Avatar URL (optional)
            </label>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Full Name
            </label>
            <input
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              type="email"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Goals</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {goals.map((g, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1 bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full text-sm"
                >
                  {g}
                  <button
                    type="button"
                    onClick={() => removeGoal(i)}
                    className="text-indigo-400 hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                placeholder='e.g. "Stay Fit", "Buy a house"'
              />
              <button
                type="button"
                onClick={addGoal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 rounded-lg"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-5 mb-6">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold text-white border-2 border-indigo-500">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-white text-xl font-bold">{profile.name}</h2>
              {profile.email && (
                <p className="text-gray-400 text-sm">{profile.email}</p>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mb-5">
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                About
              </h3>
              <p className="text-gray-300 text-sm">{profile.bio}</p>
            </div>
          )}

          {profile.goals.length > 0 && (
            <div>
              <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target size={13} /> Goals
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((g, i) => (
                  <span
                    key={i}
                    className="bg-indigo-900/50 text-indigo-300 px-3 py-1 rounded-full text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!profile.bio && profile.goals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User size={40} className="mx-auto mb-3 opacity-30" />
              <p>Click "Edit" to fill in your profile</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
