'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

export default function PublicFormPage() {
    const params = useParams();
    const [form, setForm] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/forms/${params.id}`)
            .then(res => res.json())
            .then(data => {
                setForm(data);
                // Initialize formData with empty values
                const initialData: any = {};
                if (data.schema?.fields) {
                    data.schema.fields.forEach((field: any) => {
                        initialData[field.name] = field.type === 'file' ? null : '';
                    });
                }
                setFormData(initialData);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [params.id]);

    const handleChange = (name: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/submissions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ formId: params.id, data: formData })
            });
            setSubmitted(true);
        } catch (error) {
            console.error(error);
            alert('Failed to submit form. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading form...</div>;
    if (!form) return <div className="p-8 text-center">Form not found</div>;
    
    if (submitted) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
                <div className="text-green-500 text-5xl mb-4">✓</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
                <p className="text-gray-600">Your submission has been recorded.</p>
            </div>
        </div>
    );

    const schema = form.schema || {};
    const fields = schema.fields || [];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-blue-600 p-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">{schema.title || form.title}</h1>
                    <p className="opacity-90">{schema.description || form.description}</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {fields.map((field: any, idx: number) => (
                        <div key={idx} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            
                            {field.type === 'textarea' ? (
                                <textarea
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={4}
                                    placeholder={field.placeholder || ''}
                                />
                            ) : field.type === 'file' ? (
                                <div>
                                    <ImageUpload 
                                        onUpload={(url: string) => handleChange(field.name, url)}
                                    />
                                    {formData[field.name] && (
                                        <div className="mt-2">
                                            <img 
                                                src={formData[field.name]} 
                                                alt="Uploaded" 
                                                className="max-w-xs h-auto rounded-lg"
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : field.type === 'number' ? (
                                <input
                                    type="number"
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                    min={field.validation?.min}
                                    max={field.validation?.max}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={field.placeholder || ''}
                                />
                            ) : field.type === 'email' ? (
                                <input
                                    type="email"
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                    pattern={field.validation?.pattern}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={field.placeholder || ''}
                                />
                            ) : (
                                <input
                                    type={field.type || 'text'}
                                    value={formData[field.name] || ''}
                                    onChange={(e) => handleChange(field.name, e.target.value)}
                                    required={field.required}
                                    minLength={field.validation?.min}
                                    maxLength={field.validation?.max}
                                    pattern={field.validation?.pattern}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={field.placeholder || ''}
                                />
                            )}
                            
                            {field.helpText && (
                                <p className="text-xs text-gray-500">{field.helpText}</p>
                            )}
                        </div>
                    ))}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Submitting...' : 'Submit Form'}
                    </button>
                </form>
            </div>
        </div>
    );
}
