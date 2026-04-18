import { useState } from 'react';
import type { Job } from '../types';
import JobMatchModal from './JobMatchModal';

const STATUS_CONFIG: Record<string, { border: string; badge: string; label: string }> = {
  applied:      { border: 'border-l-blue-500',   badge: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',     label: 'Applied' },
  interviewing: { border: 'border-l-amber-500',  badge: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: 'Interviewing' },
  offered:      { border: 'border-l-green-500',  badge: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400', label: 'Offered' },
  rejected:     { border: 'border-l-red-400',    badge: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',         label: 'Rejected' },
  saved:        { border: 'border-l-gray-300',   badge: 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300',        label: 'Saved' },
};

interface JobCardProps {
  job: Job;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

const JobCard = ({ job, onDelete, onStatusChange }: JobCardProps) => {
  const [showMatchModal, setShowMatchModal] = useState(false);
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.saved;
  const initials = job.company_name.slice(0, 2).toUpperCase();
  const date = job.applied_date
    ? new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-xl border-l-4 ${cfg.border} border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">{job.job_title}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{job.company_name}</p>
        </div>
        <button
          onClick={() => onDelete(job.id)}
          title="Delete"
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>

      {/* Status select */}
      <div className="mb-3">
        <select
          aria-label="Job status"
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value)}
          className={`text-xs px-2.5 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${cfg.badge}`}
        >
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* AI Match button */}
      <button
        onClick={() => setShowMatchModal(true)}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors mb-3"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        AI Match
      </button>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        {job.job_url ? (
          <a href={job.job_url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline">
            View posting
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        ) : (
          <span />
        )}
        <span className="text-xs text-gray-400 dark:text-gray-500">{date}</span>
      </div>

      {job.notes && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 leading-relaxed">{job.notes}</p>
      )}

      {showMatchModal && (
        <JobMatchModal job={job} onClose={() => setShowMatchModal(false)} />
      )}
    </div>
  );
};

export default JobCard;