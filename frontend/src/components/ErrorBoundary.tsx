import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Settings } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
  autoReloading: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isChunkError: false,
      autoReloading: false
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const isChunk = 
      error.name === 'ChunkLoadError' || 
      /chunk|loading|dynamically|imported|module|failed/i.test(error.message || '');
      
    return { 
      hasError: true, 
      error,
      isChunkError: isChunk,
      autoReloading: isChunk
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    
    // Check if it is a chunk load/module import error
    const isChunk = 
      error.name === 'ChunkLoadError' || 
      /chunk|loading|dynamically|imported|module|failed/i.test(error.message || '');
      
    if (isChunk) {
      const chunkReloadKey = 'rup_chunk_reload_attempted';
      const lastAttempt = sessionStorage.getItem(chunkReloadKey);
      
      // If we haven't tried reloading yet in this session tab, do it once automatically after 800ms
      if (!lastAttempt) {
        sessionStorage.setItem(chunkReloadKey, 'true');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        // If we already tried, don't infinite loop, just show the retry button and stop reloading state
        this.setState({ autoReloading: false });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Clean up reload key when page successfully loads or is reset
      const clearReloadFlag = () => {
        sessionStorage.removeItem('rup_chunk_reload_attempted');
      };

      if (this.state.isChunkError && this.state.autoReloading) {
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6 font-sans">
            <div className="relative">
              {/* Dual rotating premium gears */}
              <Settings className="w-16 h-16 text-[#ff5c00] animate-[spin_4s_linear_infinite]" />
              <Settings className="w-8 h-8 text-amber-500 absolute -bottom-1 -right-1 animate-[spin_3s_linear_infinite_reverse]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Optimizing Connection</h2>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed font-semibold">
                Page modules are taking longer than usual to retrieve. We are automatically refreshing the connection pipeline for you...
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-[#ff5c00] text-[10px] font-bold uppercase tracking-widest animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Connecting and reloading...</span>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto space-y-6 font-sans">
          <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Temporary connection issue</h2>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold max-w-md mx-auto">
              We encountered a slight delay loading this section. Please reload to re-establish the connection.
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                clearReloadFlag();
                window.location.reload();
              }}
              className="bg-[#ff5c00] hover:bg-black text-white text-xs font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Page
            </button>
            <button
              onClick={() => {
                clearReloadFlag();
                this.setState({ hasError: false, error: null, isChunkError: false, autoReloading: false });
                window.location.href = '/';
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black px-6 py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
            >
              Go to Home
            </button>
          </div>

          {this.state.error && (
            <details className="mt-4 text-left w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-[11px] text-gray-600 font-mono">
              <summary className="cursor-pointer font-bold text-gray-700 select-none hover:text-gray-900">
                Technical Details ({this.state.error.message || 'Error details'})
              </summary>
              <div className="mt-2 p-2 bg-gray-100 rounded text-[10px] text-rose-600 overflow-x-auto whitespace-pre-wrap">
                {this.state.error.stack || this.state.error.message}
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
