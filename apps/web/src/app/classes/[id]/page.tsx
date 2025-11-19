'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

interface StudentMetric {
  studentId: string;
  studentName: string;
  avgScorePct: number | null;
  sessionsThisWeek: number;
  avgAccuracyPct: number | null;
  recentMood: number | null;
}

interface Assignment {
  id: string;
  title: string;
  topic: string;
  dueAt: string;
  timeEstimateMin: number;
}

export default function ClassDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;

  const [metrics, setMetrics] = useState<StudentMetric[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [minScore, setMinScore] = useState<number | ''>('');
  const [maxMood, setMaxMood] = useState<number | ''>('');
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    topic: '',
    dueAt: '',
    timeEstimateMin: 30,
  });

  useEffect(() => {
    loadMetrics();
    loadAssignments();
  }, [classId]);

  const loadMetrics = async () => {
    try {
      const data = await api.getClassMetrics(classId);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const data = await api.getClassAssignments(classId);
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert datetime-local to ISO string
      const dueAtISO = assignmentForm.dueAt
        ? new Date(assignmentForm.dueAt).toISOString()
        : '';
      
      await api.createAssignment({
        classId,
        title: assignmentForm.title,
        topic: assignmentForm.topic,
        dueAt: dueAtISO,
        timeEstimateMin: assignmentForm.timeEstimateMin,
      });
      setShowAssignmentForm(false);
      setAssignmentForm({ title: '', topic: '', dueAt: '', timeEstimateMin: 30 });
      // Reload assignments and refresh the page to update assignment count
      await loadAssignments();
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create assignment');
    }
  };

  const filteredMetrics = metrics.filter((m) => {
    if (minScore !== '' && (m.avgScorePct === null || m.avgScorePct < minScore)) {
      return false;
    }
    if (maxMood !== '' && (m.recentMood !== null && m.recentMood > maxMood)) {
      return false;
    }
    return true;
  });

  const avgAccuracy =
    metrics.length > 0
      ? metrics
          .filter((m) => m.avgAccuracyPct !== null)
          .reduce((sum, m) => sum + (m.avgAccuracyPct || 0), 0) /
        metrics.filter((m) => m.avgAccuracyPct !== null).length
      : null;

  const activeStudents = metrics.filter((m) => m.sessionsThisWeek >= 2).length;
  const lowMoodCount = metrics.filter((m) => m.recentMood !== null && m.recentMood <= 2).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading class details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/classes')}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Class Details</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Class Summary */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Class Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Average Accuracy</p>
                <p className="text-2xl font-semibold">
                  {avgAccuracy !== null ? `${avgAccuracy.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-2xl font-semibold">{activeStudents}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Mood Count</p>
                <p className="text-2xl font-semibold">{lowMoodCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold">{metrics.length}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Minimum Score (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Mood (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxMood}
                  onChange={(e) => setMaxMood(e.target.value ? Number(e.target.value) : '')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Any"
                />
              </div>
            </div>
          </div>

          {/* Assignment Creation */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Assignments</h2>
              <button
                onClick={() => setShowAssignmentForm(!showAssignmentForm)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                {showAssignmentForm ? 'Cancel' : 'Create Assignment'}
              </button>
            </div>
            {showAssignmentForm && (
              <form onSubmit={handleCreateAssignment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={assignmentForm.title}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, title: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Topic</label>
                  <input
                    type="text"
                    required
                    value={assignmentForm.topic}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, topic: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Due Date</label>
                    <input
                      type="datetime-local"
                      required
                      value={assignmentForm.dueAt}
                      onChange={(e) =>
                        setAssignmentForm({ ...assignmentForm, dueAt: e.target.value })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Time Estimate (minutes)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={assignmentForm.timeEstimateMin}
                      onChange={(e) =>
                        setAssignmentForm({
                          ...assignmentForm,
                          timeEstimateMin: Number(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Create
                </button>
              </form>
            )}
            
            {/* Assignments List */}
            {assignments.length === 0 ? (
              <div className="mt-4 text-center text-gray-500 py-4">
                No assignments yet. Create your first assignment above.
              </div>
            ) : (
              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Topic
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Estimate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {assignments.map((assignment) => {
                        const dueDate = new Date(assignment.dueAt);
                        const isOverdue = dueDate < new Date();
                        const isDueSoon = dueDate <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && !isOverdue;
                        
                        return (
                          <tr key={assignment.id} className={isOverdue ? 'bg-red-50' : isDueSoon ? 'bg-yellow-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {assignment.title}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.topic}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600 font-medium' : ''}>
                                {dueDate.toLocaleDateString()} {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {assignment.timeEstimateMin} min
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Roster Table */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Student Roster</h2>
            </div>
            {filteredMetrics.length === 0 ? (
              <div className="px-4 py-5 text-center text-gray-500">
                No students match the current filters
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sessions (7d)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Avg Accuracy
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recent Mood
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMetrics.map((metric) => (
                      <tr key={metric.studentId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {metric.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.avgScorePct !== null
                            ? `${metric.avgScorePct.toFixed(1)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.sessionsThisWeek}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.avgAccuracyPct !== null
                            ? `${metric.avgAccuracyPct.toFixed(1)}%`
                            : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {metric.recentMood !== null ? metric.recentMood : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

