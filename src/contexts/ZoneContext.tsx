import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RiskZone, PPEItem, ALL_PPE_ITEMS } from '@/data/mockData';

export interface ZonePPERules {
  low: PPEItem[];
  medium: PPEItem[];
  high: PPEItem[];
}

interface ZoneContextType {
  zonePPERules: ZonePPERules;
  updateLowRiskPPE: (items: PPEItem[]) => void;
  updateMediumRiskPPE: (items: PPEItem[]) => void;
  getRequiredPPE: (zone: RiskZone) => PPEItem[];
}

const defaultRules: ZonePPERules = {
  low: ['Helmet', 'Safety Shoes'],
  medium: ['Helmet', 'Gloves', 'Safety Vest', 'Safety Shoes'],
  high: ALL_PPE_ITEMS, // All PPE required, non-editable
};

const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

export const ZoneProvider = ({ children }: { children: ReactNode }) => {
  const [zonePPERules, setZonePPERules] = useState<ZonePPERules>(defaultRules);

  const updateLowRiskPPE = (items: PPEItem[]) => {
    setZonePPERules((prev) => ({
      ...prev,
      low: items,
    }));
  };

  const updateMediumRiskPPE = (items: PPEItem[]) => {
    setZonePPERules((prev) => ({
      ...prev,
      medium: items,
    }));
  };

  const getRequiredPPE = (zone: RiskZone): PPEItem[] => {
    return zonePPERules[zone];
  };

  return (
    <ZoneContext.Provider
      value={{
        zonePPERules,
        updateLowRiskPPE,
        updateMediumRiskPPE,
        getRequiredPPE,
      }}
    >
      {children}
    </ZoneContext.Provider>
  );
};

export const useZone = () => {
  const context = useContext(ZoneContext);
  if (context === undefined) {
    throw new Error('useZone must be used within a ZoneProvider');
  }
  return context;
};
