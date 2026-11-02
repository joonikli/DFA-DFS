const links = ['Overview', 'Reports', 'Projects', 'Settings']

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="brand">DFA-DFS</div>
      <ul>
        {links.map((l, i) => (
          <li key={l}><a href="#" className={i === 0 ? 'active' : ''}>{l}</a></li>
        ))}
      </ul>
    </nav>
  )
}
