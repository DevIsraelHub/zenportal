declare module '@auth0/nextjs-auth0/client' {
  export type UseUserResult = {
    user: any;
    error: any;
    isLoading: boolean;
  };

  export function useUser(): UseUserResult;
}


