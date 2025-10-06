// ============================================================================
// BESS Site Survey System v2.0 - Automation Badge Component
// ============================================================================

import React from 'react';

interface AutomationBadgeProps {
  level: 'AUTO' | 'SEMI' | 'MANUAL';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const AutomationBadge: React.FC<AutomationBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true
}) => {
  const getStyles = () => {
    const baseStyles = 'inline-flex items-center gap-1 rounded-full font-medium';
    
    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base'
    };

    const levelStyles = {
      AUTO: 'bg-green-100 text-green-800 border border-green-200',
      SEMI: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      MANUAL: 'bg-gray-100 text-gray-800 border border-gray-200'
    };

    return `${baseStyles} ${sizeStyles[size]} ${levelStyles[level]}`;
  };

  const getIcon = () => {
    if (!showIcon) return null;

    const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';

    switch (level) {
      case 'AUTO':
        return (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'SEMI':
        return (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'MANUAL':
        return (
          <svg className={iconSize} fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
        );
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'AUTO':
        return '自動';
      case 'SEMI':
        return '半自動';
      case 'MANUAL':
        return '手動';
    }
  };

  return (
    <span className={getStyles()}>
      {getIcon()}
      <span>{getLabel()}</span>
    </span>
  );
};
