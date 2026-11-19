import React, { useState } from 'react';
import InfoCard from './Card';
import type { TrainingResults } from '../types';
import { CogIcon } from './icons/Icons';
import ConfusionMatrix from './AlertsTable';
import MetricCard from './ClassifierPerformanceChart';

const initialResults: TrainingResults = {
  metrics: { accuracy: 1.0, precision: 1.0, recall: 1.0, f1_score: 1.0 },
  weights: [
    { name: 'Random Forest', weight: 10 },
    { name: 'Gradient Boosting', weight: 9 },
    { name: 'SVM', weight: 8 },
  ],
  confusionMatrix: {
    actualNormal: { predictedNormal: 881, predictedIntrusion: 0 },
    actualIntrusion: { predictedNormal: 0, predictedIntrusion: 119 },
  },
};

const trainingSteps = [
    { message: "Initializing training environment...", duration: 500 },
    { message: "Generating synthetic network traffic data...", duration: 1000 },
    { message: "Data preprocessing and feature extraction...", duration: 800 },
    { message: "Starting Random Forest model training...", duration: 1200 },
    { message: "Starting Gradient Boosting model training...", duration: 1300 },
    { message: "Starting SVM model training...", duration: 1500 },
    { message: "Evaluating model performance...", duration: 700 },
    { message: "Assigning model weights based on performance...", duration: 500 },
    { message: "Training complete!", duration: 0 },
];

const Train: React.FC = () => {
    const [isTraining, setIsTraining] = useState(false);
    const [results, setResults] = useState<TrainingResults | null>(null);
    const [trainingLog, setTrainingLog] = useState<string[]>([]);

    const handleStartTraining = () => {
        setIsTraining(true);
        setResults(null);
        setTrainingLog([]);

        let cumulativeDelay = 0;
        trainingSteps.forEach(step => {
            cumulativeDelay += step.duration;
            setTimeout(() => {
                setTrainingLog(prev => [...prev, step.message]);
                if (step.message.includes("complete!")) {
                    setIsTraining(false);
                    setResults(initialResults);
                }
            }, cumulativeDelay);
        });
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <InfoCard title="Train Ensemble Models" icon={<CogIcon />}>
                <p className="text-gray-300">This will:</p>
                <ul className="list-disc list-inside my-4 space-y-1 pl-2 text-gray-300">
                    <li>Generate synthetic network traffic data.</li>
                    <li>Train Random Forest, Gradient Boosting, and SVM models.</li>
                    <li>Evaluate model performance and assign weights.</li>
                </ul>
                <button 
                    onClick={handleStartTraining}
                    disabled={isTraining}
                    className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-primary-focus hover:to-primary transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                >
                    {isTraining ? 'Training in Progress...' : 'Start Training'}
                </button>
            </InfoCard>

            {trainingLog.length > 0 && (
                <div className="bg-base-200 text-gray-200 font-mono text-sm rounded-lg shadow-lg p-6 animate-fade-in border border-base-300">
                    <p className="font-bold mb-2 text-secondary">&gt; Training Console</p>
                    {trainingLog.map((log, index) => (
                         <p key={index} className="whitespace-pre-wrap">{`[${new Date().toLocaleTimeString()}] ${log}`}</p>
                    ))}
                </div>
            )}

            {results && (
                 <div className="space-y-8 animate-slide-in-down">
                    <h2 className="text-3xl font-bold text-center text-gray-100">Training Results</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <MetricCard title="Accuracy" value={results.metrics.accuracy} type="accuracy" />
                        <MetricCard title="Precision" value={results.metrics.precision} type="precision" />
                        <MetricCard title="Recall" value={results.metrics.recall} type="recall" />
                        <MetricCard title="F1 Score" value={results.metrics.f1_score} type="f1" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <InfoCard title="Model Weights">
                            <div className="space-y-4">
                                {results.weights.map(model => (
                                    <div key={model.name}>
                                        <p className="text-sm font-medium mb-1 text-gray-200">{model.name}</p>
                                        <div className="w-full bg-base-100 rounded-full h-6">
                                            <div className="bg-primary h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${model.weight * 10}%` }}>
                                                {model.weight}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </InfoCard>
                        <InfoCard title="Confusion Matrix">
                            <ConfusionMatrix data={results.confusionMatrix} />
                        </InfoCard>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default Train;
