import { useState } from 'react';

function FancySelect({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select',
  className = '',
  disabled = false,
  ...selectProps
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const hasEmptyOption = options.some((option) => option.value === '');
  const visibleRows = Math.min(Math.max(options.length, 2), 6);
  const selectedOption = options.find((option) => option.value === value);
  const hasSelection = Boolean(selectedOption && selectedOption.value !== '');

  const handleChange = (event) => {
    onChange(event);
    setIsOpen(false);
    setActiveIndex(-1);
    event.currentTarget.blur();
  };

  const openSelect = () => {
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const closeSelect = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div
      className={[
        'select-control',
        isOpen ? 'select-control-open' : '',
        hasSelection ? 'select-control-selected' : 'select-control-placeholder',
        className,
      ].filter(Boolean).join(' ')}
    >
      <select
        id={id}
        name={name}
        value={value}
        size={isOpen ? visibleRows : 1}
        disabled={disabled}
        onChange={handleChange}
        onFocus={openSelect}
        onBlur={closeSelect}
        onMouseLeave={() => setActiveIndex(-1)}
        className={`travel-select${isOpen ? ' travel-select-open' : ''}`}
        {...selectProps}
      >
        {!hasEmptyOption && value === '' ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option, index) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            className={activeIndex === index ? 'select-option-active' : ''}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseMove={() => setActiveIndex(index)}
          >
            {option.label}
          </option>
        ))}
      </select>
      {!isOpen ? <span className="select-chevron" aria-hidden="true" /> : null}
    </div>
  );
}

export default FancySelect;
