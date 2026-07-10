import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6 font-sans">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Something went wrong</h2>
            <p className="text-sm text-gray-500 leading-relaxed font-semibold">
              An unexpected error occurred while rendering this page. You can reload the page or navigate back to the home screen.
            </p>
          </div>
          {this.state.error && (
            <pre className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-[10px] text-gray-500 text-left overflow-x-auto font-mono max-h-40 leading-relaxed select-all">
              {this.state.error.stack || this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#ff5c00] hover:bg-black text-white text-xs font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
