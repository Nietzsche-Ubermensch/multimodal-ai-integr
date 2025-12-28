import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkSimple, MagnifyingGlass, Trash } from "@phosphor-icons/react";

export function SavedPrompts() {
  return (
    <div className="space-y-6">
      <Card className="p-8 border-border bg-card/50 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-4">Saved Prompts</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Manage your frequently-used prompts. Click any prompt to load it into the tester.
        </p>

        <div className="relative">
          <MagnifyingGlass size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search prompts by name or tags..."
            className="pl-10"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          {
            name: "Code Review",
            content: "Review this code for bugs, security issues, and best practices...",
            tags: ["development", "code"],
            usageCount: 12
          },
          {
            name: "Document Summary",
            content: "Summarize the following document in 3-5 bullet points...",
            tags: ["productivity", "summarization"],
            usageCount: 8
          },
          {
            name: "Creative Writing",
            content: "Write a creative story about...",
            tags: ["creative", "writing"],
            usageCount: 5
          }
        ].map((prompt, i) => (
          <Card key={i} className="p-6 border-border hover:border-primary/50 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookmarkSimple size={20} className="text-primary" weight="fill" />
                <h3 className="font-bold">{prompt.name}</h3>
              </div>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash size={16} className="text-destructive" />
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 font-mono">
              {prompt.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                Used {prompt.usageCount}x
              </span>
            </div>

            <Button className="w-full mt-4" variant="outline">
              Load Prompt
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-6 border-border bg-muted/10">
        <p className="text-sm text-muted-foreground text-center">
          💡 Save prompts from the Test or Compare tabs to build your library
        </p>
      </Card>
    </div>
  );
}
