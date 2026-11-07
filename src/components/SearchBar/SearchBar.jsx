// Figma: Components › Search Bar (node 813:13407)
import { Search } from 'lucide-react'
import './SearchBar.css'

export default function SearchBar({ value, onChange, placeholder = 'Search', label = 'Search' }) {
  return (
    <label className="search-bar">
      <Search size={18} strokeWidth={2} aria-hidden="true" />
      <span className="visually-hidden">{label}</span>
      <input
        type="search"
        className="text-body"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}
