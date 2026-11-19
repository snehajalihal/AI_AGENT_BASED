import React from 'react';
import InfoCard from './Card';
import { InfoIcon, CogIcon, CodeIcon } from './icons/Icons';

const About: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-gray-100 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                    About The IDS System
                </h1>
                <p className="mt-3 text-xl text-gray-400 sm:mt-4">
                    An advanced, machine learning-powered security solution.
                </p>
            </div>
            
            <InfoCard title="Our Mission" icon={<InfoIcon />}>
                <p className="text-gray-300">
                    Our mission is to provide a powerful, intuitive, and adaptable Intrusion Detection System (IDS) that leverages the strength of ensemble machine learning. We aim to democratize network security by creating a tool that not only accurately detects threats but also allows for user interaction and incremental learning, ensuring the system evolves to counter new and emerging cyber threats effectively.
                </p>
            </InfoCard>

            <InfoCard title="How It Works: Ensemble Learning" icon={<CogIcon />}>
                <p className="text-gray-300 mb-4">
                    This system doesn't rely on a single model. Instead, it uses an "ensemble" approach, combining the predictions of multiple diverse machine learning algorithms to arrive at a more robust and accurate conclusion. This method, known as Incremental Majority Voting, reduces the risk of errors from any single model.
                </p>
                <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300">
                    <li><strong>Multiple Models:</strong> We utilize Random Forest, Gradient Boosting, and Support Vector Machines (SVM), each with unique strengths in pattern recognition.</li>
                    <li><strong>Weighted Voting:</strong> Each model is assigned a "weight" based on its historical performance. Models that perform better have a greater say in the final decision.</li>
                    <li><strong>User Influence:</strong> Through the "Vote" page, users can contribute to the model preference, influencing which algorithm gets prioritized in the prediction process.</li>
                    <li><strong>Incremental Updates:</strong> The system can be retrained on new data, allowing it to adapt to new types of network traffic and potential threats without starting from scratch.</li>
                </ul>
            </InfoCard>

            <InfoCard title="Technology Stack" icon={<CodeIcon />}>
                <p className="text-gray-300 mb-4">
                    This application is built with a modern, performant, and scalable technology stack:
                </p>
                 <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300">
                    <li><strong>Frontend Framework:</strong> React for a dynamic and component-based user interface.</li>
                    <li><strong>Styling:</strong> Tailwind CSS for a utility-first, highly customizable design system that enables rapid UI development.</li>
                    <li><strong>Data Visualization:</strong> Recharts for creating beautiful, interactive, and responsive charts and graphs.</li>
                    <li><strong>Language:</strong> TypeScript for type safety, better developer experience, and more maintainable code.</li>
                </ul>
            </InfoCard>
        </div>
    );
};

export default About;
