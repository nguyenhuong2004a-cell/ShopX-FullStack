export default function Modal({ title, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <header className="modal-header">
          <h3>{title}</h3>
        </header>

        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}