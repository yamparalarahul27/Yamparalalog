import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Filter, SortAsc, LayoutGrid, Clock } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  viewMode: "card" | "timeline";
  onViewModeChange: (mode: "card" | "timeline") => void;
}

export function FilterBar({
  categories,
  selectedCategory,
  sortBy,
  onCategoryChange,
  onSortChange,
  viewMode,
  onViewModeChange,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Category Filter */}
        <div className="flex-1 min-w-[200px]">
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter by Category
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By Date */}
        <div className="flex-1 min-w-[200px]">
          <Label className="text-sm font-medium mb-2 flex items-center gap-2">
            <SortAsc className="h-4 w-4" />
            Sort by Date
          </Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Newest First" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex-1 min-w-[200px]">
          <Label className="text-sm font-medium mb-2">
            View Mode
          </Label>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "card" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => onViewModeChange("card")}
            >
              <LayoutGrid className="h-4 w-4" />
              Card View
            </Button>
            <Button
              variant={viewMode === "timeline" ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => onViewModeChange("timeline")}
            >
              <Clock className="h-4 w-4" />
              Timeline View
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}