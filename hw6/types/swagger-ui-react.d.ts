/**
 * Type declarations for swagger-ui-react
 * This module does not have official TypeScript definitions,
 * so we provide a minimal type declaration here.
 */

declare module 'swagger-ui-react' {
  import { Component } from 'react';

  export interface SwaggerUIProps {
    url?: string;
    spec?: any;
    onComplete?: (system: any) => void;
    requestInterceptor?: (request: any) => any;
    responseInterceptor?: (response: any) => any;
    docExpansion?: 'list' | 'full' | 'none';
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    displayOperationId?: boolean;
    displayRequestDuration?: boolean;
    filter?: boolean | string;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    tryItOutEnabled?: boolean;
    requestSnippetsEnabled?: boolean;
    requestSnippets?: {
      generators?: {
        [key: string]: {
          [key: string]: any;
        };
      };
      defaultExpanded?: boolean;
      languages?: string[];
    };
    plugins?: any[];
    layout?: string;
    deepLinking?: boolean;
    showMutatedRequest?: boolean;
    supportedSubmitMethods?: string[];
    validatorUrl?: string | null;
    withCredentials?: boolean;
    persistAuthorization?: boolean;
    [key: string]: any;
  }

  export default class SwaggerUI extends Component<SwaggerUIProps> {}
}

