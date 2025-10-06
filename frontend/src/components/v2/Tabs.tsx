// ============================================================================
// BESS Site Survey System v2.0 - Tabs Component
// ============================================================================

import React, { useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, children }) => {
  return (
    <div className="w-full">
      {/* タブヘッダー */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`
                  ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                  ${activeTab === tab.id
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
};

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: React.ReactNode;
}

export const TabPanel: React.FC<TabPanelProps> = ({ id, activeTab, children }) => {
  if (id !== activeTab) return null;
  
  return (
    <div className="animate-fadeIn">
      {children}
    </div>
  );
};
