const ODS = ['ODS 6', 'ODS 9', 'ODS 11', 'ODS 13'];

export default function Footer() {
  return (
    <footer className="dashboard-footer">
      <p>AquaCore — IA + Cloud para um futuro hídrico sustentável</p>
      <div className="ods-badges">
        {ODS.map((tag) => (
          <span key={tag} className="ods-badge">
            {tag}
          </span>
        ))}
      </div>
    </footer>
  );
}
