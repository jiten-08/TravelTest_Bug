import { useEffect, useRef, useState } from 'react';

function FancySelect({ id, name, value, onChange, options = [], placeholder = 'Select', label, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('click', handleOutside);
    return () => document.removeEventListener('click', handleOutside);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div className={['relative', className].filter(Boolean).join(' ')} ref={ref}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className="flex min-h-[52px] w-full items-center justify-between px-5 text-left text-sm font-bold travel-select"
      >
        <span className="truncate">{selectedLabel}</span>
        <span className="ml-3 text-sm text-slate-500">▾</span>
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-labelledby={id}
          className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-xl bg-white p-2 shadow-lg ring-1 ring-black/5"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange({ target: { name, value: opt.value } });
                setOpen(false);
              }}
              className={`cursor-pointer rounded-lg px-4 py-2 text-sm hover:bg-slate-50 ${opt.value === value ? 'bg-primary-600 text-white' : 'text-slate-800'}`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default FancySelect;
