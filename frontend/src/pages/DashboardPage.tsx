import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Job } from '../types';
import AddJobModal from '../components/AddJobModal';
import JobCard from '../components/JobCard';
import ThemeToggle from '../components/ThemeToggle';
import ResumeAnalyzer from '../components/ResumeAnalyzer';

const STATUSES = ['all', 'applied', 'interviewing', 'offered', 'rejected', 'saved'] as const;
type FilterStatus = typeof STATUSES[number];

const DashboardPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const response = await jobsApi.getAll();
      setJobs(response.data.data);
    } catch {
      console.error('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this application?')) return;
    try {
      await jobsApi.delete(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch { console.error('Failed to delete job'); }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await jobsApi.update(id, { status: newStatus });
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status: newStatus } : j));
    } catch { console.error('Failed to update status'); }
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interviewing: jobs.filter(j => j.status === 'interviewing').length,
    offered: jobs.filter(j => j.status === 'offered').length,
    rejected: jobs.filter(j => j.status === 'rejected').length,
  };

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* â”€â”€â”€ Navbar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">JobTracker AI</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-700 dark:text-indigo-300">{initials}</div>
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">{user?.name}</span>
            <button onClick={handleLogout} title="Log out" className="text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ml-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* â”€â”€â”€ Stats Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-gray-900 dark:text-white', bg: 'bg-white dark:bg-gray-800' },
            { label: 'Applied', value: stats.applied, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-white dark:bg-gray-800' },
            { label: 'Interviewing', value: stats.interviewing, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-white dark:bg-gray-800' },
            { label: 'Offered', value: stats.offered, color: 'text-green-600 dark:text-green-400', bg: 'bg-white dark:bg-gray-800' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-500 dark:text-red-400', bg: 'bg-white dark:bg-gray-800' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3`}>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
        {/* AI Resume Analyzer */}
        <div className="mb-6">
          <ResumeAnalyzer />
        </div>
        {/* â”€â”€â”€ Toolbar: filter tabs + add button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1 overflow-x-auto">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === s
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && jobs.filter(j => j.status === s).length > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === s ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {jobs.filter(j => j.status === s).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Job
          </button>
        </div>

        {/* â”€â”€â”€ Job Grid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {filter === 'all' ? 'Click "Add Job" to start tracking your search.' : 'Change the filter to see other applications.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddJobModal onClose={() => setShowAddModal(false)} onJobAdded={() => { setShowAddModal(false); fetchJobs(); }} />
      )}
    </div>
  );
};

export default DashboardPage;