import React from 'react';
import type { ConfusionMatrixData } from '../types';

interface ConfusionMatrixProps {
  data: ConfusionMatrixData;
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr>
            <th className="border border-base-300 p-2"></th>
            <th colSpan={2} className="border border-base-300 p-2 font-semibold bg-base-100/30 text-gray-100">Predicted</th>
          </tr>
          <tr>
            <th className="border border-base-300 p-2 font-semibold bg-base-100/30 text-gray-100">Actual</th>
            <th className="border border-base-300 p-2 font-medium text-gray-200">Normal</th>
            <th className="border border-base-300 p-2 font-medium text-gray-200">Intrusion</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-base-300 p-2 font-medium bg-base-100/30 text-gray-100">Normal</td>
            <td className="border border-base-300 p-3 bg-success/20 text-success font-bold text-lg">{data.actualNormal.predictedNormal}</td>
            <td className="border border-base-300 p-3 bg-danger/20 text-danger font-bold text-lg">{data.actualNormal.predictedIntrusion}</td>
          </tr>
          <tr>
            <td className="border border-base-300 p-2 font-medium bg-base-100/30 text-gray-100">Intrusion</td>
            <td className="border border-base-300 p-3 bg-danger/20 text-danger font-bold text-lg">{data.actualIntrusion.predictedNormal}</td>
            <td className="border border-base-300 p-3 bg-success/20 text-success font-bold text-lg">{data.actualIntrusion.predictedIntrusion}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ConfusionMatrix;
