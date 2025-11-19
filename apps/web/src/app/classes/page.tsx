'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

interface Class {
  id: string;
  name: string;
  studentCount: number;
  assignmentCount: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await api.getClasses();
      setClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading classes...</div>
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
              <h1 className="text-xl font-semibold text-gray-900">My Classes</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No classes found</p>
          </div>
        ) : (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {classes.map((cls) => (
                  <li key={cls.id}>
                    <button
                      onClick={() => router.push(`/classes/${cls.id}`)}
                      className="block hover:bg-gray-50 w-full text-left"
                    >
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {cls.name}
                          </p>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              {cls.studentCount} students
                            </p>
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {cls.assignmentCount} assignments
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

