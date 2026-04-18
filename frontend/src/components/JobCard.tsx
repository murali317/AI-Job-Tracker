import type { Job } from '../types';

// Status badge colors — maps status text to Tailwind colors
const statusColors: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700',
  interviewing: 'bg-yellow-100 text-yellow-700',
  offered: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  saved: 'bg-gray-100 text-gray-700',
};

interface JobCardProps {
  job: Job;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
}

const JobCard = ({ job, onDelete, onStatusChange }: JobCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      {/* Header: company + delete button */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{job.job_title}</h3>
          <p className="text-sm text-gray-500">{job.company_name}</p>
        </div>
        <button
          onClick={() => onDelete(job.id)}
          className="text-gray-400 hover:text-red-500 text-sm"
          title="Delete"
        >
          ✕
        </button>
      </div>

      {/* Status dropdown */}
      <div className="mb-3">
        <select
          title="Job status"
          value={job.status}
          onChange={(e) => onStatusChange(job.id, e.target.value)}
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[job.status] || statusColors.saved}`}
        >
          <option value="saved">Saved</option>
          <option value="applied">Applied</option>
          <option value="interviewing">Interviewing</option>
          <option value="offered">Offered</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Details */}
      {job.job_url && (
        <a
          href={job.job_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline block mb-1"
        >
          View Job Posting →
        </a>
      )}

      {job.notes && (
        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{job.notes}</p>
      )}

      <p className="text-xs text-gray-300 mt-3">
        {job.applied_date
          ? `Applied: ${new Date(job.applied_date).toLocaleDateString()}`
          : `Added: ${new Date(job.created_at).toLocaleDateString()}`}
      </p>
    </div>
  );
};

export default JobCard;
