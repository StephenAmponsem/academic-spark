import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 Error Boundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary details:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });

    // Log to external service in production
    if (import.meta.env.PROD) {
      // You could send this to Sentry, LogRocket, etc.
      console.log('Logging error to external service...');
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground mb-6">
                We encountered an unexpected error. Don't worry, we're on it!
              </p>
            </div>

            {/* Error Details (Development only) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-muted rounded-lg text-left">
                <details className="text-sm">
                  <summary className="cursor-pointer font-medium text-destructive mb-2">
                    Error Details (Dev Mode)
                  </summary>
                  <div className="text-xs space-y-2 text-muted-foreground">
                    <div>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <strong>Stack:</strong>
                        <pre className="mt-1 overflow-x-auto whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={this.handleRetry}
                className="w-full"
                variant="default"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
            </div>

            {/* Support Information */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <p>
                If this problem persists, please contact support or check the{' '}
                <a href="/help" className="text-primary hover:underline">
                  help center
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to trigger error boundary
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: string) => {
    console.error('🚨 Manual error trigger:', { error, errorInfo });
    
    // You can also trigger the error boundary by throwing
    throw error;
  };
};

export default ErrorBoundary;