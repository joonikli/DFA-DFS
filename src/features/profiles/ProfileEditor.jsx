import { useState } from 'react';
import { Icon } from '../../components/Icon.jsx';
import { EventDialog } from '../events/EventEditor.jsx';

export default function ProfileEditor({ person, photoOnly, onSave, onClosed, variant = 'admin' }) {
  const volunteer = variant === 'volunteer';
  const [form, setForm] = useState({ name: person.name, jobTitle: person.jobTitle || '', location: person.location, email: person.email, phone: person.phone, bio: person.bio, photo: person.photo });
  const [error, setError] = useState('');
  const [reading, setReading] = useState(false);
  const field = (key) => ({ value: form[key], onChange: (event) => { setForm((current) => ({ ...current, [key]: event.target.value })); setError(''); } });
  const photo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) { setError('Choose a PNG, JPEG or WebP image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Choose an image smaller than 5 MB.'); return; }
    setError(''); setReading(true);
    const reader = new FileReader();
    reader.onload = () => { setForm((current) => ({ ...current, photo: reader.result })); setReading(false); };
    reader.onerror = () => { setError('This photo could not be read. Please choose another image.'); setReading(false); };
    reader.readAsDataURL(file);
  };
  return <EventDialog label={volunteer ? 'Edit volunteer profile' : 'Edit admin profile'} className="ap-profile-dialog" onClosed={onClosed}>{(close) => <form className="ap-profile-editor" onSubmit={(event) => {
    event.preventDefault();
    if (!form.name.trim() || (!volunteer && !form.jobTitle.trim()) || !form.email.trim()) { setError(volunteer ? 'Add your name and email before saving.' : 'Add your name, job title and email before saving.'); return; }
    onSave(form); close(true);
  }}>
    <header className="ae-dialog-head"><h2>Edit profile</h2><button className="icon-btn plain" type="button" aria-label="Close profile editor" onClick={() => close()}><Icon name="x" size={24} /></button></header>
    <label className="ap-field">Profile photo<input aria-label="Profile photo" autoFocus={photoOnly} type="file" accept="image/png,image/jpeg,image/webp" onChange={photo} /><small>PNG, JPEG or WebP, up to 5 MB. Changes stay in this prototype.</small></label>
    {form.photo?.startsWith('data:') && <img className="ap-photo-preview" src={form.photo} alt="New profile photo preview" />}
    <div className={volunteer ? 'ap-edit-single' : 'ap-edit-pair'}><label className="ap-field">Name<input required autoComplete="name" {...field('name')} /></label>{!volunteer && <label className="ap-field">Job title<input required {...field('jobTitle')} /></label>}</div>
    <label className="ap-field">Location<input {...field('location')} /></label>
    <div className="ap-edit-pair"><label className="ap-field">Email<input required type="email" autoComplete="email" {...field('email')} /></label><label className="ap-field">Phone<input type="tel" autoComplete="tel" {...field('phone')} /></label></div>
    <label className="ap-field">About<textarea aria-label="About" rows={5} {...field('bio')} /></label>
    {error && <p className="ae-form-error" role="alert">{error}</p>}
    <footer><button type="button" className="btn btn-purple-outline" onClick={() => close()}>Cancel</button><button type="submit" className="btn btn-dark" disabled={reading}>{reading ? 'Reading photo…' : 'Save changes'}</button></footer>
  </form>}</EventDialog>;
}
