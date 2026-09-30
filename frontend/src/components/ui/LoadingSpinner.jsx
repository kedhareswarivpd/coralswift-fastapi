const sizes = {
 sm: 'w-5 h-5 border-2',
 md: 'w-8 h-8 border-3',
 lg: 'w-12 h-12 border-4',
};

export default function LoadingSpinner({ size = 'md', text }) {
 return (
  <div className="flex flex-col items-center justify-center py-8">
   <div
    className={`${sizes[size]} rounded-full border-ink-muted border-t-brand`}
    style={{ animation: 'spin 0.6s linear infinite' }}
   />
   {text && <p className="mt-3 text-body-md text-ink-muted">{text}</p>}
  </div>
 );
}
