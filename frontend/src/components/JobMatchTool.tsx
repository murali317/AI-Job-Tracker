import { useState } from 'react';
import { aiApi } from '../api';
import type { JobMatchResult } from '../types';
import { showToast } from './Toast';
import ResumeUpload from './ResumeUpload';

const JobMatchTool = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobMatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleMatch = async () => {
    const trimmedResume = resumeText.trim();
    const trimmedJD = jobDescription.trim();

    if (trimmedResume.length < 50) {
      setError('Resume text must be at least 50 characters.');
      return;
    }
    if (trimmedJD.length < 50) {
      setError('Job description must be at least 50 characters.');
      return;
    }
    if (trimmedResume.length > 15000) {
      setError('Resume text is too long. Maximum 15,000 characters.');
      return;
    }
    if (trimmedJD.length > 10000) {
      setError('Job description is too long. Maximum 10,000 characters.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const response = await aiApi.matchJob(trimmedResume, trimmedJD);
      const data = response.data.data;
      setResult(data);
      if (data.matchPercentage >= 75) {
        showToast({ type: 'success', message: `Great match! ${data.matchPercentage}% — you're a strong fit for this role. Go for it!` });
      } else if (data.matchPercentage >= 50) {
        showToast({ type: 'info', message: `${data.matchPercentage}% match — decent fit. Check the tips to strengthen your application.` });
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Match analysis failed. Please try again.');
      } else {
        setError('Match analysis failed. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const percentColor = (pct: number): string => {
    if (pct >= 75) return 'text-green-600 dark:text-green-400';
    if (pct >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  const percentBg = (pct: number): string => {
    if (pct >= 75) return 'bg-green-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/70 dark:border-gray-700 shadow-sm dark:shadow-none ring-1 ring-gray-100 dark:ring-0 overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">AI Job Match</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Compare your resume against any job description</p>
          </div>
        </div>
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700">
          {!result ? (
            <div className="pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Resume</label>
                <ResumeUpload
                  value={resumeText}
                  onChange={setResumeText}
                  onError={setError}
                  rows={5}
                  accentColor="indigo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={5}
                  placeholder="Paste the full job description here..."
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-400 dark:text-gray-500">{jobDescription.trim().length.toLocaleString()} / 10,000</span>
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">
                  <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {error}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleMatch}
                  disabled={loading || resumeText.trim().length < 50 || jobDescription.trim().length < 50}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
                      Matching...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Analyze Match
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 space-y-5">
              {/* Match percentage */}
              <div className="text-center py-3">
                <p className={`text-5xl font-bold ${percentColor(result.matchPercentage)}`}>
                  {result.matchPercentage}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Match Score</p>
                <div className="w-full max-w-xs mx-auto mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${percentBg(result.matchPercentage)}`} style={{ width: `${result.matchPercentage}%` }} />
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 leading-relaxed">{result.summary}</p>
              </div>

              {/* Matching skills */}
              {result.matchingSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Skills You Have
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing skills */}
              {result.missingSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                    Skills to Acquire
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {result.tips.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 2a6 6 0 00-4.472 10.035l-.544.543A2 2 0 006 15h8a2 2 0 001.016-2.422l-.544-.543A6 6 0 0010 2z" clipRule="evenodd" /></svg>
                    Tips
                  </h4>
                  <ul className="space-y-1.5">
                    {result.tips.map((t, i) => (
                      <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-indigo-500 mt-0.5">•</span> {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => { setResult(null); setError(''); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
                >
                  Analyze Again
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobMatchTool;
