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
    console.error('Admin ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6 font-sans text-white">
          <div className="w-16 h-16 rounded-full bg-rose-950/50 border border-rose-900/50 flex items-center justify-center text-rose-400 animate-pulse">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tight">Something went wrong</h2>
            <p className="text-sm text-slate-400 leading-relaxed font-semibold">
              An unexpected error occurred while rendering the Admin panel.
            </p>
          </div>
          {this.state.error && (
            <pre className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-[10px] text-slate-400 text-left overflow-x-auto font-mono max-h-48 leading-relaxed select-all">
              {this.state.error.stack || this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="bg-[#ff5c00] hover:bg-orange-600 text-white text-xs font-black px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-black px-6 py-3.5 rounded-xl uppercase tracking-wider transition-all cursor-pointer"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
