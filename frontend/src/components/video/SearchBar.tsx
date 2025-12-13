import { useState } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SearchBarProps {
  onSearch: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function SearchBar({
  onSearch,
  categories,
  selectedCategory,
  onCategoryChange,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search creators, videos, or topics..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="pl-12 h-12 bg-secondary/50 border-transparent focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 ${showFilters ? "border-primary text-primary bg-primary/10" : ""}`}
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
      </form>

      <motion.div
        initial={false}
        animate={{ height: showFilters ? "auto" : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="flex flex-wrap gap-2 py-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className={`cursor-pointer transition-all hover:scale-105 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "hover:border-primary/50 hover:bg-primary/10"
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </motion.div>
    </div>
  );
}