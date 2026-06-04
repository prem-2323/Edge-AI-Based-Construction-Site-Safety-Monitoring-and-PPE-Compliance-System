import { PPEItem } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Lock, ShieldCheck } from 'lucide-react';

interface PPELockedDisplayProps {
  requiredItems: PPEItem[];
}

export const PPELockedDisplay = ({ requiredItems }: PPELockedDisplayProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Lock className="h-4 w-4 text-destructive" />
        <span>Mandatory PPE Requirements (Non-editable):</span>
      </div>

      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-5 w-5 text-destructive" />
          <span className="text-sm font-semibold text-destructive">
            Full PPE Required - All safety equipment mandatory
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {requiredItems.map((item) => (
            <Badge
              key={item}
              variant="destructive"
              className="cursor-default"
            >
              <Lock className="h-3 w-3 mr-1" />
              {item}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};
