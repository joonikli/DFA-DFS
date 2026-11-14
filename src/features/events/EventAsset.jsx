export default function EventAsset({ name, className = '' }) {
  return <img className={`ae-asset ${className}`} src={`/assets/events/${name}.svg`} alt="" aria-hidden="true" />;
}
