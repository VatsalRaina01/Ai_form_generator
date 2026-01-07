import FormBuilder from '@/components/FormBuilder';

export default function GeneratePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    Create a New Form
                </h1>
                <FormBuilder />
            </div>
        </div>
    );
}
