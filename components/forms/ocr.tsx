import { useRef, useState } from 'react';
import { Button } from '../ui/button';

const OCRForm = () => {
    const [imgSrc, setImgSrc] = useState('');
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const onSelectFile = async (e: any) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
            const imageUrl = reader.result?.toString() || "";
            setImgSrc(imageUrl);

            setLoading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/ocr', {
                    method: 'POST',
                    body: formData,
                });

                const data = await response.json();
                if (response.ok) {
                    setResult(data.text);
                } else {
                    setError(data.message);
                    console.error(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                setError('An error occurred while processing the image.');
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <Button variant="default" className="cursor-pointer mb-[15px]" onClick={handleButtonClick}>
                <span>Choose a photo</span>
                <input
                    type="file"
                    accept="image/*"
                    onChange={onSelectFile}
                    ref={fileInputRef}
                    className="hidden"
                />
            </Button>
            {imgSrc && (
                <div>
                    <img src={imgSrc} alt="Selected" style={{ maxWidth: '100%', maxHeight: '300px' }} />
                </div>
            )}
            {loading && <p>Processing...</p>}
            {result && (
                <div className='p-2 mt-4 rounded-md shadow w-full account-form_input'>
                    <h3>OCR Result:</h3>
                    <p>{result}</p>
                </div>
            )}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default OCRForm;
