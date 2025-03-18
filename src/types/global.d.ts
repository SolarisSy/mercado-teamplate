declare module 'react' {
  import * as React from '@types/react';
  export = React;
  export as namespace React;
}

declare module 'react-router-dom' {
  import * as ReactRouter from '@types/react-router-dom';
  export = ReactRouter;
  export as namespace ReactRouter;
}

declare module 'react-hot-toast' {
  interface Toast {
    success(message: string): void;
    error(message: string): void;
  }

  interface ToastFunction {
    (message: string): void;
    (options: { message: string; type: 'success' | 'error' }): void;
    success(message: string): void;
    error(message: string): void;
  }

  const toast: ToastFunction;
  export default toast;
}

declare module 'nanoid' {
  export function nanoid(): string;
}

declare module 'react-icons/hi' {
  import { ComponentType, SVGAttributes } from 'react';

  interface IconBaseProps extends SVGAttributes<SVGElement> {
    children?: React.ReactNode;
    size?: string | number;
    color?: string;
    title?: string;
  }

  type IconType = ComponentType<IconBaseProps>;

  export const HiPlus: IconType;
  export const HiX: IconType;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
} 