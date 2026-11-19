import React, { useState } from 'react';
import InfoCard from './Card';
import { Page } from '../types';
import MetricCard from './ClassifierPerformanceChart';

const initialUpdateResults = {
  metrics: { accuracy: 0.86, precision: 0.8345, recall: 0.86, f1_score: 0.8081 },
  weights: [
    { name: 'Random Forest', weight: 9 },
    { name: 'Gradient Boosting', weight: 9 },
    { name: 'SVM', weight: 8 },
  ],
};

interface UpdateProps {
    setPage: (page: Page) => void;
}

const Update: React.FC<UpdateProps> = ({ setPage }) => {
    const [editMode, setEditMode] = useState(false);
    const [weights, setWeights] = useState(initialUpdateResults.weights);

    const handleWeightChange = (name: string, newWeight: number) => {
        setWeights(prev => prev.map(w => w.name === name ? { ...w, weight: newWeight } : w));
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <InfoCard title="Update Model Weights">
                <p className="text-gray-300">This will:</p>
                <ul className="list-disc list-inside my-2 space-y-1 pl-2 text-gray-300">
                    <li>Generate new network traffic data.</li>
                    <li>Evaluate each model's performance on the new data.</li>
                    <li>Update the voting weights based on performance.</li>
                </ul>
            </InfoCard>

            <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center text-gray-100">Update Results</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard title="Accuracy" value={initialUpdateResults.metrics.accuracy} type="accuracy" />
                    <MetricCard title="Precision" value={initialUpdateResults.metrics.precision} type="precision" />
                    <MetricCard title="Recall" value={initialUpdateResults.metrics.recall} type="recall" />
                    <MetricCard title="F1 Score" value={initialUpdateResults.metrics.f1_score} type="f1" />
                </div>
                
                <div className="bg-base-200 border border-base-300 rounded-lg shadow-lg">
                    <div className="bg-base-100/30 text-gray-100 px-5 py-3 rounded-t-lg flex items-center justify-between border-b border-base-300">
                        <h2 className="font-bold text-lg">Updated Model Weights</h2>
                        <button 
                            onClick={() => setEditMode(!editMode)}
                            className={`text-sm px-4 py-1 rounded-md font-semibold transition-colors ${
                                editMode 
                                ? 'bg-danger text-white hover:bg-rose-500'
                                : 'bg-secondary text-gray-900 hover:bg-cyan-300'
                            }`}
                        >
                            {editMode ? 'Cancel' : 'Edit Weights'}
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        {weights.map(model => (
                            <div key={model.name}>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-sm font-medium text-gray-200">{model.name}</p>
                                    <p className="text-sm font-bold text-primary">{model.weight}</p>
                                </div>
                                {editMode ? (
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        value={model.weight}
                                        onChange={(e) => handleWeightChange(model.name, parseInt(e.target.value))}
                                        className="w-full h-2 bg-base-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                ) : (
                                    <div className="w-full bg-base-100 rounded-full h-6">
                                        <div className="bg-primary h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${model.weight * 10}%` }}>
                                            {model.weight}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                         {editMode && (
                            <div className="text-right pt-4">
                                <button onClick={() => setEditMode(false)} className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-focus transition-colors">
                                    Save Weights
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <button 
                        onClick={() => setPage('Dashboard')}
                        className="bg-header border border-base-300 text-gray-200 font-bold py-3 px-8 rounded-lg hover:bg-base-100 transition-colors shadow-md"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Update;
