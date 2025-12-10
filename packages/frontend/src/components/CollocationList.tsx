"use client";

import { useState } from "react";
import CollocationCard from "./CollocationCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

export default function CollocationList({ collocations, onCollocationClick }: CollocationListProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  const filteredCollocations = collocations.filter((collocation) => {
    const matchesSearch =
      searchTerm === "" ||
      collocation.phrase.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collocation.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collocation.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDifficulty =
      difficultyFilter === "all" || collocation.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search collocations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredCollocations.length} of {collocations.length} collocations
      </p>

      {/* Collocation cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCollocations.length > 0 ? (
          filteredCollocations.map((collocation) => (
            <CollocationCard
              key={collocation._id}
              collocation={collocation}
              onClick={() => onCollocationClick?.(collocation)}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No collocations found</p>
          </div>
        )}
      </div>
    </div>
  );
}

