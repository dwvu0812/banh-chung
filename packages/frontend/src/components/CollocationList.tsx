"use client";

import { useState } from "react";
import CollocationCard from "./CollocationCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface CollocationComponent {
  word: string;
  meaning: string;
  partOfSpeech?: string;
}

interface Collocation {
  _id: string;
  phrase: string;
  meaning: string;
  components: CollocationComponent[];
  examples: string[];
  pronunciation?: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface CollocationListProps {
  collocations: Collocation[];
  onCollocationClick?: (collocation: Collocation) => void;
  enableClientFiltering?: boolean;
}

export default function CollocationList({
  collocations,
  onCollocationClick,
  enableClientFiltering = true,
}: CollocationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredCollocations = enableClientFiltering
    ? collocations.filter((collocation) => {
        const matchesSearch =
          searchTerm === "" ||
          collocation.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
          collocation.meaning
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          collocation.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          );

        const matchesDifficulty =
          difficultyFilter === "all" ||
          collocation.difficulty === difficultyFilter;

        return matchesSearch && matchesDifficulty;
      })
    : collocations;

  return (
    <div className="min-spacing-lg">
      {/* Clean Filters - only show when client filtering is enabled */}
      {enableClientFiltering && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search collocations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 min-focus"
              />
            </div>
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="w-full sm:w-[140px] min-focus">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="min-card">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <p className="min-text-caption text-center mb-6">
            {filteredCollocations.length} of {collocations.length} collocations
          </p>
        </>
      )}

      {/* Collocation cards */}
      <div className="min-grid-auto">
        {filteredCollocations.length > 0 ? (
          filteredCollocations.map((collocation, index) => (
            <div
              key={collocation._id}
              className="min-animate-fadeIn"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CollocationCard
                collocation={collocation}
                onClick={() => onCollocationClick?.(collocation)}
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-16">
            <p className="min-text-body text-muted-foreground">
              No collocations found
            </p>
            <p className="min-text-caption text-muted-foreground mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
