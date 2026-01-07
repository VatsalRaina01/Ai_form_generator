'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Loader2, Save, Check } from 'lucide-react';
import ImageUpload from './ImageUpload';

export default function FormBuilder() {
    const router = useRouter();
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [schema, setSchema] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formPurpose, setFormPurpose] = useState('');

    useEffect(() => {
        // Get userId from localStorage
        const storedUserId = localStorage.getItem('userId');
        if (!storedUserId) {
            router.push('/login');
            return;
        }
        setUserId(storedUserId);
    }, [router]);

    const handleGenerate = async () => {
        if (!prompt) return;
        if (!userId) {
            alert('Please log in to generate forms');
            router.push('/login');
            return;
        }

        setLoading(true);
        setSaved(false);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forms/generate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ prompt, userId })
            });

            if (!res.ok) {
                throw new Error('Failed to generate form');
            }

            const data = await res.json();
            setSchema(data.schema);
            setFormTitle(data.schema.title || '');
            setFormPurpose(prompt);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to generate form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!schema || !userId) {
            alert('Please generate a form first');
            return;
        }

        if (!formTitle.trim()) {
            alert('Please provide a form title');
            return;
        }

        setSaving(true);
        setSaved(false);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forms`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    owner: userId,
                    title: formTitle,
                    description: schema.description || '',
                    schema: schema,
                    purpose: formPurpose || formTitle
                })
            });

            if (!res.ok) {
                throw new Error('Failed to save form');
            }

            const savedForm = await res.json();
            setSaved(true);
            setTimeout(() => {
                router.push(`/dashboard`);
            }, 1500);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to save form. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!userId) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">AI Form Generator</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe your form (e.g., 'A job application with resume upload')"
                        className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                        disabled={loading}
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                        Generate
                    </button>
                </div>
            </div>

            {schema && (
                <div className="bg-white rounded-xl shadow-lg p-6 animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex-1 mr-4">
                            <input
                                type="text"
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="Form Title"
                                className="text-xl font-bold text-gray-800 w-full border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving || saved}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saved ? (
                                <>
                                    <Check size={20} />
                                    Saved!
                                </>
                            ) : saving ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Form
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-gray-600 mb-6">{schema.description}</p>

                    <div className="space-y-4 border-t pt-6">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Form Preview</h3>
                        {schema.fields.map((field: any, idx: number) => (
                            <div key={idx} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
                                <label className="font-medium text-gray-700">
                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea 
                                        className="p-3 border border-gray-200 rounded-lg w-full" 
                                        placeholder={field.placeholder || ''}
                                        disabled
                                    />
                                ) : field.type === 'file' ? (
                                    <div className="p-3 border border-gray-200 rounded-lg w-full bg-gray-100 text-gray-500 text-sm">
                                        File upload field
                                    </div>
                                ) : (
                                    <input
                                        type={field.type}
                                        className="p-3 border border-gray-200 rounded-lg w-full"
                                        placeholder={field.placeholder || ''}
                                        disabled
                                    />
                                )}
                                {field.helpText && (
                                    <p className="text-xs text-gray-500">{field.helpText}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
