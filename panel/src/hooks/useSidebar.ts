import { useState, useCallback, useEffect, useRef } from "react";

export interface UseSidebarReturn {
  isExpanded: boolean;
  isHovering: boolean;
  expandSidebar: () => void;
  collapseSidebar: () => void;
  toggleSidebar: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
}

export function useSidebar(): UseSidebarReturn {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const expandSidebar = useCallback(() => {
    setIsExpanded(true);
  }, []);

  const collapseSidebar = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleMouseEnter = useCallback(() => {
    // Clear any pending collapse timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setIsHovering(true);
    setIsExpanded(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout to collapse the sidebar
    timeoutRef.current = setTimeout(() => {
      setIsExpanded(false);
      timeoutRef.current = null;
    }, 150);
  }, []);

  // Auto-collapse on window resize to mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsExpanded(false);
        // Clear timeout on resize
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on mount

    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isExpanded,
    isHovering,
    expandSidebar,
    collapseSidebar,
    toggleSidebar,
    handleMouseEnter,
    handleMouseLeave
  };
}
