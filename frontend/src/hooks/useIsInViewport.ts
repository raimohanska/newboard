import { useState, useEffect, RefObject } from 'react';

interface UseIsInViewportOptions {
  rootMargin?: string;
  once?: boolean;
}

export const useIsInViewport = (
  ref: RefObject<HTMLElement>,
  options: UseIsInViewportOptions = {}
): boolean => {
  const { rootMargin = '100px', once = true } = options;
  const [isInViewport, setIsInViewport] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          if (once) {
            observer.disconnect();
          }
        } else if (!once) {
          setIsInViewport(false);
        }
      },
      { rootMargin }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref, rootMargin, once]);

  return isInViewport;
};

