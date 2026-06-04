import { RiskZone, PPEItem, ALL_PPE_ITEMS } from '@/data/mockData';
import { useZone } from '@/contexts/ZoneContext';
import { PPECheckboxSelector } from './PPECheckboxSelector';
import { PPEMultiSelect } from './PPEMultiSelect';
import { PPELockedDisplay } from './PPELockedDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, ShieldAlert, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ZoneConfigPanelProps {
  activeZone: RiskZone;
}

const zoneInfo = {
  low: {
    title: 'Low Risk Zone Configuration',
    description: 'Minimal hazards, limited PPE required. Select which items are mandatory.',
    icon: ShieldOff,
    color: 'text-success',
    availablePPE: ['Helmet', 'Gloves', 'Safety Shoes'] as PPEItem[],
  },
  medium: {
    title: 'Medium Risk Zone Configuration',
    description: 'Moderate hazards, configurable PPE. Add or remove requirements as needed.',
    icon: Shield,
    color: 'text-warning',
    availablePPE: ['Helmet', 'Gloves', 'Safety Vest', 'Safety Shoes'] as PPEItem[],
  },
  high: {
    title: 'High Risk Zone Configuration',
    description: 'Critical hazards, full PPE mandatory. Requirements cannot be modified.',
    icon: ShieldAlert,
    color: 'text-destructive',
    availablePPE: ALL_PPE_ITEMS,
  },
};

export const ZoneConfigPanel = ({ activeZone }: ZoneConfigPanelProps) => {
  const { zonePPERules, updateLowRiskPPE, updateMediumRiskPPE } = useZone();
  const info = zoneInfo[activeZone];
  const Icon = info.icon;

  const handleLowRiskChange = (items: PPEItem[]) => {
    updateLowRiskPPE(items);
    toast.success('Low Risk Zone PPE rules updated', {
      description: `${items.length} PPE item(s) now required`,
    });
  };

  const handleMediumRiskChange = (items: PPEItem[]) => {
    updateMediumRiskPPE(items);
    toast.success('Medium Risk Zone PPE rules updated', {
      description: `${items.length} PPE item(s) now required`,
    });
  };

  return (
    <Card className="border-2 transition-colors duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg bg-muted', info.color)}>
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon className={cn('h-5 w-5', info.color)} />
              {info.title}
            </CardTitle>
            <CardDescription>{info.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {activeZone === 'low' && (
          <PPECheckboxSelector
            availableItems={info.availablePPE}
            selectedItems={zonePPERules.low}
            onSelectionChange={handleLowRiskChange}
          />
        )}

        {activeZone === 'medium' && (
          <PPEMultiSelect
            availableItems={info.availablePPE}
            selectedItems={zonePPERules.medium}
            onSelectionChange={handleMediumRiskChange}
          />
        )}

        {activeZone === 'high' && (
          <PPELockedDisplay requiredItems={ALL_PPE_ITEMS} />
        )}
      </CardContent>
    </Card>
  );
};
