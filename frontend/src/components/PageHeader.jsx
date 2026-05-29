function PageHeader({ eyebrow, title, description, className = '', ...props }) {
  return (
    <div className={['mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', className].join(' ')} {...props}>
      {eyebrow ? <p className="text-sm font-bold uppercase tracking-wide text-accent-500">{eyebrow}</p> : null}
      <h1 className="mt-2 font-heading text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
      {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p> : null}
    </div>
  );
}

export default PageHeader;
