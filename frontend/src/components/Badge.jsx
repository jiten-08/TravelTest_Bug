function Badge({ children, className = '', ...props }) {
  return (
    <span
      className={['inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700', className].join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
