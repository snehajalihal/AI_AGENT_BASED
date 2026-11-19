import React, { useState } from 'react';
import InfoCard from './Card';

const Predict: React.FC = () => {
    const [fileName, setFileName] = useState('');
    const [isPredicting, setIsPredicting] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFileName(event.target.files[0].name);
        } else {
            setFileName('');
        }
    };

    const handlePredict = () => {
        if (!fileName) {
            alert('Please select a file first.');
            return;
        }
        setIsPredicting(true);
        setResult(null);
        setTimeout(() => {
            const isIntrusion = Math.random() > 0.7; // 30% chance of intrusion
            setResult(isIntrusion ? 'Intrusion Detected!' : 'Traffic is Normal');
            setIsPredicting(false);
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
            <InfoCard title="Make Predictions on New Traffic">
                <p className="mb-6 text-gray-400">
                    Upload a network traffic data file (e.g., .pcap, .csv) to classify it as normal or an intrusion using the trained ensemble model.
                </p>
                <div className="flex items-center space-x-4 mb-6">
                    <label className="block w-full">
                        <span className="sr-only">Choose file</span>
                        <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"/>
                    </label>
                </div>
                 <button 
                    onClick={handlePredict}
                    disabled={isPredicting || !fileName}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-primary-focus hover:to-primary transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                >
                    {isPredicting ? 'Analyzing...' : 'Predict'}
                </button>
                {result && (
                    <div className={`mt-6 text-center p-4 rounded-lg font-semibold animate-fade-in ${result === 'Intrusion Detected!' ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                        {result}
                    </div>
                )}
            </InfoCard>
        </div>
    );
};

export default Predict;
