export default function StatCard({ icon: Icon, title, value, detail }) {
  return (
    <article className="ww-stat-card">
      <span className="ww-stat-icon">{Icon && <Icon size={19} />}</span>
      <span className="ww-stat-title">{title}</span>
      <strong className="ww-stat-value">{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}
