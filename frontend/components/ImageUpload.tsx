'use client';

import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default'); // User needs to set this in Cloudinary

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            onUpload(data.secure_url);
        } catch (error) {
            console.error('Upload failed', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                <span className="text-sm font-medium text-gray-700">Upload Image</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            </label>
        </div>
    );
}
