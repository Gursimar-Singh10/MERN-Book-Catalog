export default function Spinner({ label = "Loading" }) {
  return (
    <span className="spinner" role="status">
      <span className="spinner-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
