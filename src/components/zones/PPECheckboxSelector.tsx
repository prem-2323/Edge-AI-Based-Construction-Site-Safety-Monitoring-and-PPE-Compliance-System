import { PPEItem } from '@/data/mockData';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface PPECheckboxSelectorProps {
  availableItems: PPEItem[];
  selectedItems: PPEItem[];
  onSelectionChange: (items: PPEItem[]) => void;
}

export const PPECheckboxSelector = ({
  availableItems,
  selectedItems,
  onSelectionChange,
}: PPECheckboxSelectorProps) => {
  const handleToggle = (item: PPEItem) => {
    if (selectedItems.includes(item)) {
      onSelectionChange(selectedItems.filter((i) => i !== item));
    } else {
      onSelectionChange([...selectedItems, item]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">
        Select required PPE items:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {availableItems.map((item) => (
          <div
            key={item}
            className="flex items-center space-x-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <Checkbox
              id={`low-${item}`}
              checked={selectedItems.includes(item)}
              onCheckedChange={() => handleToggle(item)}
            />
            <Label
              htmlFor={`low-${item}`}
              className="text-sm cursor-pointer flex-1"
            >
              {item}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
