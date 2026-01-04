// Skeleton Loading Components for AI Model Hub

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function ModelCardSkeleton() {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm animate-pulse">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Language Flag Skeleton */}
            <div className="w-8 h-8 bg-muted rounded-full" />
            
            <div className="space-y-2">
              {/* Title Skeleton */}
              <div className="h-5 w-32 bg-muted rounded" />
              {/* Description Skeleton */}
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
          
          {/* Provider Badge Skeleton */}
          <div className="h-5 w-16 bg-muted rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-3/4 bg-muted rounded" />
        </div>

        {/* Capabilities Skeleton */}
        <div className="flex flex-wrap gap-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-5 w-16 bg-muted rounded-full" />
          ))}
        </div>

        {/* Context Window Skeleton */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full" />
        </div>

        {/* Deployment Options Skeleton */}
        <div className="flex flex-wrap gap-1">
          {[1, 2].map(i => (
            <div key={i} className="h-5 w-14 bg-muted rounded-full" />
          ))}
        </div>

        {/* Actions Skeleton */}
        <div className="flex gap-2 pt-2">
          <div className="h-8 flex-1 bg-muted rounded" />
          <div className="h-8 flex-1 bg-muted rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ModelCatalogSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ModelCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RAGPipelineSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted rounded" />
          <div className="h-4 w-64 bg-muted rounded" />
        </div>
        <div className="h-9 w-32 bg-muted rounded" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 space-y-2">
              <div className="h-4 w-16 bg-muted rounded" />
              <div className="h-8 w-12 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search Bar Skeleton */}
      <div className="h-10 w-full bg-muted rounded" />

      {/* Results Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-5/6 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Messages Skeleton */}
      <div className="space-y-3">
        {/* User Message */}
        <div className="flex justify-end">
          <div className="h-12 w-48 bg-primary/20 rounded-lg" />
        </div>
        {/* Assistant Message */}
        <div className="flex justify-start">
          <div className="space-y-2 w-3/4">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-5/6 bg-muted rounded" />
            <div className="h-4 w-4/5 bg-muted rounded" />
          </div>
        </div>
      </div>

      {/* Input Skeleton */}
      <div className="flex gap-2">
        <div className="h-10 flex-1 bg-muted rounded" />
        <div className="h-10 w-20 bg-muted rounded" />
      </div>
    </div>
  );
}

export function StatsBarSkeleton() {
  return (
    <div className="flex items-center gap-4 animate-pulse">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-6 w-20 bg-muted rounded-full" />
      ))}
    </div>
  );
}
