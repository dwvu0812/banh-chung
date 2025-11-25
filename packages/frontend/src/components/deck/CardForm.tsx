"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface CardFormProps {
  card?: {
    _id?: string;
    word: string;
    definition: string;
    pronunciation?: string;
    examples?: string[];
  };
  onSubmit: (cardData: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CardForm({ card, onSubmit, onCancel, isLoading }: CardFormProps) {
  const [word, setWord] = useState(card?.word || "");
  const [definition, setDefinition] = useState(card?.definition || "");
  const [examples, setExamples] = useState<string[]>(card?.examples || [""]);

  useEffect(() => {
    if (card) {
      setWord(card.word);
      setDefinition(card.definition);
      setExamples(card.examples || [""]);
    }
  }, [card]);

  const handleAddExample = () => {
    setExamples([...examples, ""]);
  };

  const handleRemoveExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index));
  };

  const handleExampleChange = (index: number, value: string) => {
    const newExamples = [...examples];
    newExamples[index] = value;
    setExamples(newExamples);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredExamples = examples.filter((ex) => ex.trim() !== "");
    onSubmit({
      word,
      definition,
      examples: filteredExamples,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="word">Word/Phrase *</Label>
        <Input
          id="word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          required
          placeholder="Enter word or phrase"
        />
      </div>

      <div>
        <Label htmlFor="definition">Definition *</Label>
        <Input
          id="definition"
          value={definition}
          onChange={(e) => setDefinition(e.target.value)}
          required
          placeholder="Enter definition"
        />
      </div>

      <div>
        <Label>Examples</Label>
        {examples.map((example, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              value={example}
              onChange={(e) => handleExampleChange(index, e.target.value)}
              placeholder={`Example ${index + 1}`}
            />
            {examples.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveExample(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddExample}
        >
          Add Example
        </Button>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : card?._id ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}

