import { useState } from 'react';
import { jobsApi } from '../api';
import type { Job } from '../types';

interface EditJobModalProps {
  job: Job;
  onClose: () => void;
  onJobUpdated: (updated: Job) => void;
}

const inputClass = "w-full px-3.5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const EditJobModal = ({ job, onClose, onJobUpdated }: EditJobModalProps) => {
  const [companyName, setCompanyName] = useState(job.company_name);
  const [jobTitle, setJobTitle] = useState(job.job_title);
  const [jobUrl, setJobUrl] = useState(job.job_url || '');
  const [status, setStatus] = useState(job.status);
  const [appliedDate, setAppliedDate] = useState(job.applied_date ? job.applied_date.split('T')[0] : '');
  const [notes, setNotes] = useState(job.notes || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        company_name: companyName,
        job_title: jobTitle,
        job_url: jobUrl || null,
        status,
        applied_date: appliedDate || null,
        notes: notes || null,
      };
      await jobsApi.update(job.id, payload);
      onJobUpdated({
        ...job,
        company_name: companyName,
        job_title: jobTitle,
        job_url: jobUrl || null,
        status,
        applied_date: appliedDate || null,
        notes: notes || null,
      });
    } catch {
      setError('Failed to update job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Edit Job Application</h2>
          <button onClick={onClose} title="Close" aria-label="Close modal" className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelClass}>Company <span className="text-red-400">*</span></label>
              <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required placeholder="e.g. Google" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Job Title <span className="text-red-400">*</span></label>
              <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required placeholder="e.g. Software Engineer" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Job URL</label>
              <input type="url" value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} aria-label="Status" className={inputClass}>
                <option value="saved">Saved</option>
                <option value="applied">Applied</option>
                <option value="interviewing">Interviewing</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Applied Date</label>
              <input type="date" value={appliedDate} onChange={e => setAppliedDate(e.target.value)} className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." className={`${inputClass} resize-none`} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {loading ? (<><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Saving...</>) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;
