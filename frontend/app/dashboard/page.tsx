'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, FileText, ExternalLink, LogOut } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        
        if (!storedUserId || !token) {
            router.push('/login');
            return;
        }

        setUserId(storedUserId);
        fetchForms(storedUserId, token);
    }, [router]);

    const fetchForms = async (userId: string, token: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forms/user/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (res.ok) {
                const data = await res.json();
                setForms(data);
            } else if (res.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch forms:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Forms</h1>
                        <p className="text-gray-600 mt-1">
                            {localStorage.getItem('userEmail')}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href="/generate"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                        >
                            <Plus size={20} />
                            Create New
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>

                {forms.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No forms yet</h3>
                        <p className="text-gray-500 mb-6">Create your first form using AI</p>
                        <Link
                            href="/generate"
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            <Plus size={20} />
                            Create Your First Form
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {forms.map((form: any) => (
                            <div key={form._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                        <FileText size={24} />
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(form.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{form.title}</h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">{form.description}</p>

                                <div className="flex gap-2 mt-auto">
                                    <Link
                                        href={`/form/${form._id}`}
                                        className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                                    >
                                        <ExternalLink size={16} />
                                        View
                                    </Link>
                                    <Link
                                        href={`/submissions/${form._id}`}
                                        className="flex-1 text-center py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                                    >
                                        Results
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
