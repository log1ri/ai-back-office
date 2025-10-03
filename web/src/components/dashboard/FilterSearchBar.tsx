import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Filter, Trash2 } from "lucide-react";

interface FilterSearchBarProps {
  onFilterClick?: () => void;
  onSearchChange?: (query: string) => void;
  onClearLogs?: () => void;
  searchQuery?: string;
  placeholder?: string;
  logCount?: number;
}

// Single Responsibility: Component รับผิดชอบเฉพาะ filter และ search controls
export const FilterSearchBar = ({ 
  onFilterClick,
  onSearchChange,
  onClearLogs,
  searchQuery = "",
  placeholder = "Search your logs",
  logCount = 0
}: FilterSearchBarProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onFilterClick}
      >
        <Filter className="h-4 w-4" /> Filters
      </Button>
      <Input 
        placeholder={placeholder} 
        className="flex-1" 
        value={searchQuery}
        onChange={(e) => onSearchChange?.(e.target.value)}
      />
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onClearLogs}
        disabled={logCount === 0}
      >
        <Trash2 className="h-4 w-4" /> Clear ({logCount})
      </Button>
    </div>
  );
};
