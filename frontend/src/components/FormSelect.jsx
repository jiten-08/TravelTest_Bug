function FormSelect({ className = '', children, ...props }) {
  return (
    <select className={['travel-select', className].join(' ')} {...props}>
      {children}
    </select>
  );
}

export default FormSelect;
