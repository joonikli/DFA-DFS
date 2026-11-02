import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import StatCard from './components/StatCard.jsx'
import Modal from './components/Modal.jsx'
import { stats, items as initialItems } from './data.js'

export default function App() {
  const [items, setItems] = useState(initialItems)
  const [selected, setSelected] = useState(null)
  const [showNew, setShowNew] = useState(false)

  function addItem(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    setItems([...items, { id: Date.now(), name: form.get('name'), owner: form.get('owner'), status: 'Active' }])
    setShowNew(false)
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <header className="topbar">
          <h1>Dashboard</h1>
          <button className="btn primary" onClick={() => setShowNew(true)}>+ New item</button>
        </header>

        <section className="stats">
          {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </section>

        <section className="panel">
          <h2>Items</h2>
          <table>
            <thead>
              <tr><th>Name</th><th>Owner</th><th>Status</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} onClick={() => setSelected(item)}>
                  <td>{item.name}</td>
                  <td>{item.owner}</td>
                  <td><span className={`badge ${item.status.toLowerCase()}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      <Modal open={selected !== null} title={selected?.name} onClose={() => setSelected(null)}>
        <p><strong>Owner:</strong> {selected?.owner}</p>
        <p><strong>Status:</strong> {selected?.status}</p>
      </Modal>

      <Modal open={showNew} title="New item" onClose={() => setShowNew(false)}>
        <form className="form" onSubmit={addItem}>
          <label>Name <input name="name" required autoFocus /></label>
          <label>Owner <input name="owner" required /></label>
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowNew(false)}>Cancel</button>
            <button type="submit" className="btn primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
