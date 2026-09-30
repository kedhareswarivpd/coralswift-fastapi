import { Component } from 'react';
import Icon from './Icon.jsx';

/**
 * React error boundary — catches render-phase errors in its subtree and
 * displays a recovery UI instead of a white screen. Use at the route level
 * (one per page) or at the app root for a global catch-all.
 *
 * Props:
 *  children  – the protected content
 *  pageName  – optional label shown in the fallback (e.g. "Blog")
 *  onReset  – optional callback invoked when the user clicks "Try Again"
 */
export default class ErrorBoundary extends Component {
 constructor(props) {
  super(props);
  this.state = { error: null, errorInfo: null };
 }

 static getDerivedStateFromError(error) {
  return { error };
 }

 componentDidCatch(error, errorInfo) {
  console.error('[ErrorBoundary]', error, errorInfo);
  this.setState({ errorInfo });
 }

 handleRetry = () => {
  this.setState({ error: null, errorInfo: null });
  this.props.onReset?.();
 };

 handleGoHome = () => {
  this.setState({ error: null, errorInfo: null });
  window.location.href = '/';
 };

 handleGoBack = () => {
  this.setState({ error: null, errorInfo: null });
  window.history.back();
 };

 render() {
  if (this.state.error) {
   const { pageName } = this.props;
   return (
    <div className="flex min-h-[60vh] items-center justify-center bg-surface-container px-4 dark:bg-dark-surface-container sm:px-6 lg:px-10 xl:px-12">
     <div className="max-w-md text-center">
      <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-status-error-bg">
       <Icon name="error" className="text-3xl text-status-error" />
      </div>
      <h1 className="mb-2 font-display text-headline-md text-brand-dark dark:text-white">
       {pageName ? `${pageName} Error` : 'Something went wrong'}
      </h1>
      <p className="mb-8 text-body-md text-ink-muted dark:text-white/70">
       An unexpected error occurred{pageName ? ` on the ${pageName} page` : ''}.{' '}
       Please try again or return to the homepage.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
       <button
        onClick={this.handleRetry}
        className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 font-label-caps text-label-caps uppercase text-white transition-colors hover:bg-brand-dark active:scale-95"
       >
        <Icon name="refresh" className="text-lg" /> Try Again
       </button>
       <button
        onClick={this.handleGoBack}
        className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-6 py-3 font-label-caps text-label-caps uppercase text-ink transition-colors hover:bg-surface-dim dark:border-dark-outline-variant dark:text-white dark:hover:bg-dark-surface-dim"
       >
        <Icon name="arrow_back" className="text-lg" /> Go Back
       </button>
       <button
        onClick={this.handleGoHome}
        className="inline-flex items-center gap-2 rounded-lg border border-outline-variant px-6 py-3 font-label-caps text-label-caps uppercase text-ink transition-colors hover:bg-surface-dim dark:border-dark-outline-variant dark:text-white dark:hover:bg-dark-surface-dim"
       >
        <Icon name="home" className="text-lg" /> Home
       </button>
      </div>
     </div>
    </div>
   );
  }

  return this.props.children;
 }
}
