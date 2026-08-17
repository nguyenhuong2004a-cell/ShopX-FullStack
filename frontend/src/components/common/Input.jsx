export default function Input({ value, onChange, ...rest }) {
  return <input value={value} onChange={onChange} {...rest} />;
}