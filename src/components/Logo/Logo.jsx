// Figma: Components › Logo (node 2166:34233)
import logo from '../../assets/logo.svg'

export default function Logo({ width = 64 }) {
  return <img src={logo} width={width} height={Math.round((width * 26) / 60)} alt="Dress for Success" style={{ display: 'block' }} />
}
