import { useEffect, useState } from 'react';

interface LoadingProps {
  show?: boolean;
}

export default function Loading({ show = true }: LoadingProps) {
  const [hasMinTimeElapsed, setHasMinTimeElapsed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMinTimeElapsed(true);
    }, 1000); // 1 second minimum display time

    return () => clearTimeout(timer);
  }, []);

  // Only hide if both conditions are met:
  // 1. Parent wants to hide it (show === false)
  // 2. Minimum time has elapsed (hasMinTimeElapsed === true)
  if (!show && hasMinTimeElapsed) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
      {/* Loading spinner */}
      <div className="w-12 h-12 border-4 border-[#E8F5F0] border-t-[#00603A] rounded-full animate-spin" />
      
      {/* Loading text with subtle fade animation */}
      <div className="text-[#00603A] font-medium animate-pulse">
        Loading...
      </div>
    </div>
  );
}