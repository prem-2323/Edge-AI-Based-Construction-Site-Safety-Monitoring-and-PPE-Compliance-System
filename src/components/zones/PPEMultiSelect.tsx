import { useState } from 'react';
import { PPEItem } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PPEMultiSelectProps {
  availableItems: PPEItem[];
  selectedItems: PPEItem[];
  onSelectionChange: (items: PPEItem[]) => void;
}

export const PPEMultiSelect = ({
  availableItems,
  selectedItems,
  onSelectionChange,
}: PPEMultiSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (item: PPEItem) => {
    if (selectedItems.includes(item)) {
      onSelectionChange(selectedItems.filter((i) => i !== item));
    } else {
      onSelectionChange([...selectedItems, item]);
    }
  };

  const handleRemove = (item: PPEItem) => {
    onSelectionChange(selectedItems.filter((i) => i !== item));
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Configure PPE requirements:
      </p>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 py-2"
          >
            <span className="text-muted-foreground">
              {selectedItems.length === 0
                ? 'Select PPE items...'
                : `${selectedItems.length} item(s) selected`}
            </span>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-3 bg-popover z-50" align="start">
          <div className="space-y-2">
            {availableItems.map((item) => (
              <div
                key={item}
                className={cn(
                  'flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors',
                  selectedItems.includes(item)
                    ? 'bg-warning/20'
                    : 'hover:bg-muted'
                )}
                onClick={() => handleToggle(item)}
              >
                <Checkbox
                  id={`medium-${item}`}
                  checked={selectedItems.includes(item)}
                  onCheckedChange={() => handleToggle(item)}
                />
                <Label
                  htmlFor={`medium-${item}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {item}
                </Label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected items as badges */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="bg-warning/20 text-warning-foreground hover:bg-warning/30 cursor-pointer"
            >
              {item}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
