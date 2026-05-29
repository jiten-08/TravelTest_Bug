function Button({ as: Component = 'button', className = '', variant = 'primary', children, ...props }) {
  const variants = {
    primary:
      'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-lg shadow-blue-900/20 hover:from-primary-700 hover:to-indigo-700 hover:shadow-xl',
    secondary:
      'border border-slate-200 bg-white text-slateText-muted shadow-sm hover:border-primary-100 hover:bg-primary-50 hover:text-primary-700',
    amber: 'bg-accent-500 text-white shadow-lg shadow-orange-900/20 hover:bg-accent-600',
  };

  return (
    <Component
      className={[
        'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold transition-all focus-ring',
        variants[variant],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
