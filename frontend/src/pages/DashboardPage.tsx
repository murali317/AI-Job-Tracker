import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Job } from '../types';
import AddJobModal from '../components/AddJobModal';
import JobCard from '../components/JobCard';

const DashboardPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch all jobs when the page loads
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

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this job application?')) return;
    try {
      await jobsApi.delete(id);
      // Remove the deleted job from state (no need to re-fetch)
      setJobs(jobs.filter((job) => job.id !== id));
    } catch {
      console.error('Failed to delete job');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await jobsApi.update(id, { status: newStatus });
      // Update the job in state
      setJobs(jobs.map((job) => (job.id === id ? { ...job, status: newStatus } : job)));
    } catch {
      console.error('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Navbar ──────────────────────────────────────────────── */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Job Tracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Hi, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-red-500 hover:text-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Your Applications ({jobs.length})
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            + Add Job
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-center py-12">Loading...</p>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg mb-2">No job applications yet</p>
            <p className="text-sm">Click "+ Add Job" to start tracking</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── Add Job Modal ────────────────────────────────────────── */}
      {showAddModal && (
        <AddJobModal
          onClose={() => setShowAddModal(false)}
          onJobAdded={() => {
            setShowAddModal(false);
            fetchJobs(); // Refresh the list
          }}
        />
      )}
    </div>
  );
};

export default DashboardPage;
