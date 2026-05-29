const variants = {
  success: 'bg-green-50 text-green-700',
  error: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-primary-50 text-primary-700',
};

function StatusBadge({ variant = 'info', className = '', children, ...props }) {
  return (
    <span className={['inline-flex items-center rounded-full px-3 py-1 text-xs font-bold', variants[variant], className].join(' ')} {...props}>
      {children}
    </span>
  );
}

export default StatusBadge;
