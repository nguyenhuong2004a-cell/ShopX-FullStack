export default function Empty({ message = "Không có dữ liệu" }) {
  return (
    <div className="empty">
      <p>{message}</p>
    </div>
  );
}