// ============================================================================
// BESS Site Survey System v2.0 - Score Grade Component
// ============================================================================

import React from 'react';

interface ScoreGradeProps {
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const ScoreGrade: React.FC<ScoreGradeProps> = ({
  grade,
  score,
  size = 'md',
  showScore = true
}) => {
  const getStyles = () => {
    const baseStyles = 'inline-flex items-center gap-2 rounded-lg font-bold';
    
    const sizeStyles = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-1.5 text-base',
      lg: 'px-4 py-2 text-lg'
    };

    const gradeStyles = {
      S: 'bg-purple-100 text-purple-800 border-2 border-purple-300',
      A: 'bg-blue-100 text-blue-800 border-2 border-blue-300',
      B: 'bg-green-100 text-green-800 border-2 border-green-300',
      C: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300',
      D: 'bg-red-100 text-red-800 border-2 border-red-300'
    };

    return `${baseStyles} ${sizeStyles[size]} ${gradeStyles[grade]}`;
  };

  const getGradeLabel = () => {
    const labels = {
      S: '優秀',
      A: '良好',
      B: '普通',
      C: '要改善',
      D: '不適'
    };
    return labels[grade];
  };

  return (
    <div className={getStyles()}>
      <span className="text-2xl">{grade}</span>
      <div className="flex flex-col items-start">
        <span className="text-xs opacity-75">{getGradeLabel()}</span>
        {showScore && score !== undefined && (
          <span className="text-sm font-semibold">{score.toFixed(1)}点</span>
        )}
      </div>
    </div>
  );
};

interface ScoreBarProps {
  score: number;
  label?: string;
  showValue?: boolean;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  score,
  label,
  showValue = true
}) => {
  const getColor = () => {
    if (score >= 90) return 'bg-purple-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showValue && (
            <span className="text-sm font-semibold text-gray-900">
              {score.toFixed(1)}
            </span>
          )}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
    </div>
  );
};

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  description?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  title,
  score,
  maxScore = 100,
  description
}) => {
  const percentage = (score / maxScore) * 100;
  
  const getColor = () => {
    if (percentage >= 90) return 'text-purple-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        <span className={`text-2xl font-bold ${getColor()}`}>
          {score.toFixed(1)}
        </span>
      </div>
      <ScoreBar score={percentage} showValue={false} />
      {description && (
        <p className="mt-2 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};
