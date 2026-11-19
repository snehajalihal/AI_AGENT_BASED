import React, { useState, useMemo } from 'react';
import InfoCard from './Card';
import { BarChartIcon } from './icons/Icons';

const MODELS = [
    { id: 'rf', name: 'Random Forest' },
    { id: 'gb', name: 'Gradient Boosting' },
    { id: 'svm', name: 'Support Vector Machine' },
];

const Vote: React.FC = () => {
    const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
    const [hasVoted, setHasVoted] = useState(false);
    const [votes, setVotes] = useState({ rf: 120, gb: 95, svm: 78 });

    const totalVotes = useMemo(() => Object.values(votes).reduce((sum, count) => sum + count, 0), [votes]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!hasVoted) {
            setVotes(prev => ({
                ...prev,
                [selectedModel]: prev[selectedModel as keyof typeof votes] + 1,
            }));
            setHasVoted(true);
        }
    };
    
    const handleVoteAgain = () => {
        setHasVoted(false);
    }

    return (
        <div className="max-w-5xl mx-auto animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <InfoCard title={hasVoted ? "Thank You For Voting!" : "Vote for Your Preferred Model"}>
                {hasVoted ? (
                    <div className="text-center animate-fade-in">
                        <h3 className="text-xl font-semibold text-success">Your vote has been counted!</h3>
                        <p className="mt-2 text-gray-300">You voted for: <strong>{MODELS.find(m => m.id === selectedModel)?.name}</strong>.</p>
                        <p className="mt-1 text-gray-400">The model with the most votes will be prioritized for predictions.</p>
                         <button 
                            onClick={handleVoteAgain}
                            className="mt-6 bg-base-100 text-gray-200 font-bold py-2 px-6 rounded-lg hover:bg-base-300 transition-colors"
                        >
                            Change Vote
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <p className="mb-4 text-gray-400">
                            The model with the highest number of votes will be given higher preference in the ensemble's prediction process.
                        </p>
                        <fieldset className="space-y-4 mb-6">
                            <legend className="sr-only">Models</legend>
                            {MODELS.map(model => (
                                <label key={model.id} htmlFor={model.id} className="flex items-center p-4 border border-base-300 rounded-lg hover:bg-base-100/50 cursor-pointer transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                                    <input
                                        id={model.id}
                                        name="model-vote"
                                        type="radio"
                                        value={model.id}
                                        checked={selectedModel === model.id}
                                        onChange={(e) => setSelectedModel(e.target.value)}
                                        className="h-4 w-4 text-primary focus:ring-primary border-gray-500 bg-base-100"
                                    />
                                    <span className="ml-3 block text-sm font-medium text-gray-200">
                                        {model.name}
                                    </span>
                                </label>
                            ))}
                        </fieldset>
                        <button 
                            type="submit"
                            className="w-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:from-primary-focus hover:to-primary transition-all duration-300"
                        >
                            Cast Your Vote
                        </button>
                    </form>
                )}
            </InfoCard>
            <InfoCard title="Current Standings" icon={<BarChartIcon />}>
                <div className="space-y-5">
                    <p className="text-sm text-gray-400 -mt-2">Total Votes: <span className="font-bold text-gray-200">{totalVotes}</span></p>
                    {MODELS.map(model => {
                        const percentage = totalVotes > 0 ? ((votes[model.id as keyof typeof votes] / totalVotes) * 100) : 0;
                        return (
                            <div key={model.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <p className="text-sm font-medium text-gray-200">{model.name}</p>
                                    <p className="text-sm font-semibold text-gray-300">{percentage.toFixed(1)}%</p>
                                </div>
                                <div className="w-full bg-base-100/50 rounded-full h-4 relative overflow-hidden">
                                    <div 
                                        className="bg-gradient-to-r from-secondary to-primary h-4 rounded-full transition-all duration-500 ease-out" 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </InfoCard>
        </div>
    );
};

export default Vote;
