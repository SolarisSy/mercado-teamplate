declare module 'react-router-dom' {
  import * as React from 'react';

  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    to: string;
    replace?: boolean;
    state?: any;
  }

  export const Link: React.FC<LinkProps>;
  export const Navigate: React.FC<{ to: string; replace?: boolean; state?: any }>;
  export const useNavigate: () => (to: string, options?: { replace?: boolean; state?: any }) => void;
  export const useLocation: () => { pathname: string; search: string; hash: string; state: any };
  export const useParams: <T extends Record<string, string | undefined>>() => T;
} 