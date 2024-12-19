// global.d.ts
interface Window {
    AwsWafCaptcha: {
      renderCaptcha: (
        element: HTMLElement,
        options: {
          onSuccess: (token: unknown) => void;
          onLoad: () => void;
          onError?: () => void;
          onPuzzleTimeout?: () => void;
          onPuzzleIncorrect?: () => void;
          onPuzzleCorrect?: () => void;
          apiKey: string;
        }
      ) => void;
    };
    AwsWafIntegration: {
      fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
      getToken: () => Promise<unknown>;
    };
  }
  