function FormInput({ className = '', ...props }) {
  return <input className={['travel-field', className].join(' ')} {...props} />;
}

export default FormInput;
