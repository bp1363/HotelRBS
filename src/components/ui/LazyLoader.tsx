import React, { useState, useEffect } from 'react';
import Loader from './Loader';
import { Skeleton } from './skeleton';

interface LazyLoaderProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  showSkeletonAfter?: number; // milliseconds before showing skeleton
}

const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children,
  fallback,
  showSkeletonAfter = 4000 
}) => {
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const skeletonTimer = setTimeout(() => {
      setShowSkeleton(true);
    }, showSkeletonAfter);

    // Show content after skeleton is displayed (additional delay)
    const contentTimer = setTimeout(() => {
      setShowContent(true);
    }, showSkeletonAfter + 1000);

    return () => {
      clearTimeout(skeletonTimer);
      clearTimeout(contentTimer);
    };
  }, [showSkeletonAfter]);

  // Show loader first
  if (!showSkeleton) {
    return (
      <div className="page-loader">
        {fallback || <Loader />}
      </div>
    );
  }

  // Show skeleton after loader
  if (!showContent) {
    return (
      <div className="lazy-loader-skeleton">
        {/* Header Skeleton */}
        <div className="space-y-4 p-6 border-b">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        
        {/* Content Skeleton */}
        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show actual content
  return <>{children}</>;
};

export default LazyLoader;

