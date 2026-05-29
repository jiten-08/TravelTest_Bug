function Card({ className = '', children, ...props }) {
  return (
    <div className={['rounded-2xl border border-slate-100 bg-white shadow-sm', className].join(' ')} {...props}>
      {children}
    </div>
  );
}

export default Card;
