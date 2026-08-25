import React, { startTransition as reactStartTransition } from 'react';

// Global transition types stack
let activeTransitionTypes: string[] = [];

/**
 * Add a transition type tag (e.g. 'nav-forward', 'nav-back') to customize view transitions
 */
export function addTransitionType(type: string) {
  if (!activeTransitionTypes.includes(type)) {
    activeTransitionTypes.push(type);
  }
}

/**
 * Executes a state transition with native browser View Transitions API
 */
export function startViewTransition(updateFn: () => void, types?: string[]) {
  if (types && types.length > 0) {
    types.forEach((t) => addTransitionType(t));
  }

  // Use native document.startViewTransition if available
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    const transition = (document as any).startViewTransition(() => {
      reactStartTransition(() => {
        updateFn();
      });
    });

    if (transition && transition.finished) {
      transition.finished.finally(() => {
        activeTransitionTypes = [];
      });
    } else {
      setTimeout(() => {
        activeTransitionTypes = [];
      }, 500);
    }
  } else {
    // Graceful fallback for unsupported browsers
    reactStartTransition(() => {
      updateFn();
    });
    activeTransitionTypes = [];
  }
}

export type ViewTransitionTypeMap = Record<string, string> & { default?: string };

export interface ViewTransitionProps {
  name?: string;
  share?: string | ViewTransitionTypeMap;
  enter?: string | ViewTransitionTypeMap;
  exit?: string | ViewTransitionTypeMap;
  default?: 'auto' | 'none';
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Vercel React View Transition Component
 * Declares shared element morphs and directional transition classes
 */
export const ViewTransition: React.FC<ViewTransitionProps> = ({
  name,
  share = 'morph',
  enter,
  exit,
  default: defaultProp = 'none',
  children,
  className = '',
  as: Component = 'div',
}) => {
  // Resolve active transition class from type map if active
  const resolveClass = (propValue?: string | ViewTransitionTypeMap): string => {
    if (!propValue) return '';
    if (typeof propValue === 'string') return propValue;

    for (const type of activeTransitionTypes) {
      if (propValue[type]) return propValue[type];
    }
    return propValue.default || (defaultProp === 'auto' ? 'auto' : '');
  };

  const shareClass = resolveClass(share);
  const enterClass = resolveClass(enter);
  const exitClass = resolveClass(exit);

  const transitionClasses = [shareClass, enterClass, exitClass, className]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = name
    ? ({ viewTransitionName: name } as React.CSSProperties)
    : {};

  const Comp = Component as React.ElementType;

  return (
    <Comp style={style} className={transitionClasses || undefined}>
      {children}
    </Comp>
  );
};
