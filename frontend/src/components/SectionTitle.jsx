function SectionTitle({ eyebrow, title, description, align = 'left', tone = 'light', ...props }) {
  const centered = align === 'center';
  const isDark = tone === 'dark';

  return (
    <div className={centered ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'} {...props}>
      {eyebrow ? (
        <p className={['text-sm font-bold uppercase tracking-wide', isDark ? 'text-accent-400' : 'text-accent-500'].join(' ')}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={['mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl', isDark ? 'text-white' : 'text-slate-900'].join(' ')}>
        {title}
      </h2>
      {description ? (
        <p className={['mt-3 text-base leading-7', isDark ? 'text-blue-100' : 'text-slate-600'].join(' ')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}

export default SectionTitle;
