import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const UploadForm: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [images, setImages] = useState([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!file) {
            setMessage('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setMessage('');

        console.log("formdata: " + formData.get('file'));

        try {
            const response = await fetch('/api/uploadImage', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('File upload failed');
            }

            const data = await response.json();
            console.log(data);
            setMessage('File uploaded successfully');
            setFile(null);
            fetchImages();
        } catch (error: any) {
            setMessage(`Upload error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const fetchImages = async () => {
        try {
            const response = await fetch('/api/uploadImage', {
                method: 'GET',
            });
            const data = await response.json();
            if (data.status === 'success') {
                setImages(data.files);
            } else {
                console.error('Failed to fetch images:', data.message);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const response = await fetch(`/api/uploadImage/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('File delete failed');
            }

            const data = await response.json();
            setMessage(data.message);
            fetchImages();

        } catch (error: any) {
            setMessage(`Delete error: ${error.message}`);
        }
    };

    useEffect(() => {
        fetchImages();
    }, []);

    return (
        <div className="max-w-md mx-auto my-4 p-2 border rounded-md shadow-md">
            <h2 className="text-xl font-bold mb-4">Uploaded Images</h2>
            {images.length === 0 ? (
                <p>No images found</p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {images.map((file: any) => (
                        <div key={file._id} className="flex flex-col items-center">
                            <Image 
                                src={`/api/uploadImage/${file._id}`}
                                alt={file.filename}
                                width={500}
                                height={500}
                                className='w-full h-auto object-cover'
                            />
                            <button
                                onClick={() => handleDelete(file._id)}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <h2 className="text-xl font-bold mb-4">Upload Image</h2>
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <button
                    type="submit"
                    className={`px-4 py-2 rounded-md text-white ${uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={uploading}
                >
                    {uploading ? 'Uploading...' : 'Upload'}
                </button>
            </form>
            {message && <p className="mt-4 text-center text-red-600">{message}</p>}
        </div>
    );
};

export default UploadForm;
