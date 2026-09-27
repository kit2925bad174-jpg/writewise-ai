export default function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="ww-empty">
      {Icon && (
        <span className="ww-empty-icon">
          <Icon size={24} />
        </span>
      )}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
