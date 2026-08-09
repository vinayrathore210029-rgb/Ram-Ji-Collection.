import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Admin UI Error Boundary caught an error:', error, errorInfo);
  }

  public handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-gray-800 border border-gray-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="w-14 h-14 bg-red-900/40 text-red-400 border border-red-800 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Admin Display Notice</h2>
              <p className="text-xs text-gray-400">
                A rendering issue occurred on this view. Don't worry, your data is completely safe.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-black/50 border border-gray-800 rounded-xl p-3 text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
