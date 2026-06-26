export default function PageHeader({ eyebrow, title, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="topbar-greeting">{eyebrow}</p>}
        <h1 className="topbar-title page-header-title">{title}</h1>
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}
