'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileText } from 'lucide-react';

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [form, setForm] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        fetchFormAndSubmissions(params.id as string, token);
    }, [params.id, router]);

    const fetchFormAndSubmissions = async (formId: string, token: string) => {
        try {
            // Fetch form
            const formRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forms/${formId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (formRes.ok) {
                const formData = await formRes.json();
                setForm(formData);
            }

            // Fetch submissions
            const subsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/submissions/form/${formId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (subsRes.ok) {
                const subsData = await subsRes.json();
                setSubmissions(subsData);
            } else if (subsRes.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-gray-600">Loading submissions...</div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
                <div className="text-gray-600">Form not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{form.title}</h1>
                    <p className="text-gray-600">{form.description}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">Submissions</h2>
                            <p className="text-gray-500 text-sm mt-1">
                                {submissions.length} {submissions.length === 1 ? 'submission' : 'submissions'}
                            </p>
                        </div>
                        {submissions.length > 0 && (
                            <button
                                onClick={() => {
                                    const csv = convertToCSV(submissions, form);
                                    downloadCSV(csv, `${form.title}-submissions.csv`);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                            >
                                <Download size={20} />
                                Export CSV
                            </button>
                        )}
                    </div>
                </div>

                {submissions.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No submissions yet</h3>
                        <p className="text-gray-500 mb-6">Share your form to start collecting responses</p>
                        <Link
                            href={`/form/${form._id}`}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            View Form
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {submissions.map((submission: any, idx: number) => (
                            <div key={submission._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-800">
                                        Submission #{idx + 1}
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {new Date(submission.submittedAt).toLocaleString()}
                                    </span>
                                </div>
                                
                                <div className="space-y-3">
                                    {form.schema?.fields?.map((field: any) => {
                                        const value = submission.data[field.name];
                                        return (
                                            <div key={field.name} className="border-b border-gray-100 pb-3 last:border-0">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {field.label}
                                                </label>
                                                {field.type === 'file' && value ? (
                                                    <div>
                                                        <img 
                                                            src={value} 
                                                            alt="Submitted" 
                                                            className="max-w-xs h-auto rounded-lg border border-gray-200"
                                                        />
                                                        <a 
                                                            href={value} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                                                        >
                                                            Open in new tab
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <p className="text-gray-900 whitespace-pre-wrap">
                                                        {value || <span className="text-gray-400 italic">Not provided</span>}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function convertToCSV(submissions: any[], form: any): string {
    const fields = form.schema?.fields || [];
    const headers = ['Submission Date', ...fields.map((f: any) => f.label)];
    
    const rows = submissions.map(sub => {
        const row = [new Date(sub.submittedAt).toLocaleString()];
        fields.forEach((field: any) => {
            const value = sub.data[field.name];
            row.push(value || '');
        });
        return row;
    });

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
}

function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

