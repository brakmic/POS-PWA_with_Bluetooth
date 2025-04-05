import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from '@pages/ErrorPage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorPage
            code={500}
            title="Something went wrong"
            message={this.state.error?.message || 'An unexpected error occurred'}
            onReset={this.handleReset}
          />
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
