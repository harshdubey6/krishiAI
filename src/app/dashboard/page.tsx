'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { session, isAuthenticated } = useAuth();
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  if (!isAuthenticated) {
    return null;
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/diagnose/history');
        const data = await res.json();
        if (res.ok) setRecent(data.items.slice(0, 5));
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Welcome back, {session?.user?.name || 'Farmer'}
          </h1>
          <p className="text-gray-500">Here's an overview of your plant health monitoring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Healthy Plants</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Needs Attention</p>
              <p className="text-2xl font-semibold text-gray-900">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Weather</p>
              <p className="text-2xl font-semibold text-gray-900">24°C</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Diagnoses */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Diagnoses</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : recent.length === 0 ? (
          <p className="text-sm text-gray-500">No diagnoses yet. Try the Diagnose feature to get started.</p>
        ) : (
          <div className="space-y-3">
            {recent.map((d) => (
              <div key={d.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{d.plantType} — {d.condition}</p>
                  <p className="text-sm text-gray-500">Confidence {(d.confidence * 100).toFixed(0)}% · {new Date(d.createdAt).toLocaleString()}</p>
                </div>
                <a href={`/dashboard/diagnose`} className="text-sm text-green-700 hover:underline">Open</a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
