// Volunteer roster used by admin screens (event sign-ups, profiles, dashboards).
// Deterministic: same names/stats every load.

const FIRST = ['Maureen', 'John', 'Sarah', 'Madison', 'Kyla', 'Anna', 'Erica', 'Priya', 'Jasmine', 'Lena', 'Grace', 'Olivia', 'Nadia', 'Rosa', 'Tasha', 'Hannah', 'Mei', 'Aisha', 'Claire', 'Diana', 'Elena', 'Fatima', 'Gabriela', 'Imani', 'Jada', 'Keiko', 'Lucia', 'Maya', 'Nina', 'Paula']
const LAST = ['Lee', 'Doe', 'Chen', 'Foster', 'Brooks', 'Rivera', 'Jiang', 'Patel', 'Williams', 'Novak', 'Kim', 'Johnson', 'Haddad', 'Martinez', 'Green', 'Schultz', 'Wang', 'Bello', 'Dubois', 'Ortiz']
const CITIES = ['Pittsburgh, PA', 'Washington, PA', 'Allegheny, PA', 'Monroeville, PA', 'Bethel Park, PA']

export const volunteers = Array.from({ length: 90 }, (_, i) => {
  const first = FIRST[i % FIRST.length]
  const last = LAST[(i * 7) % LAST.length]
  return {
    id: `v${String(i + 1).padStart(2, '0')}`,
    name: `${first} ${last}`,
    first,
    type: i % 4 === 3 ? 'Group' : 'Individual',
    city: CITIES[i % CITIES.length],
    email: `${first}.${last}`.toLowerCase() + '@gmail.com',
    phone: `412-${String(200 + ((i * 37) % 700)).padStart(3, '0')}-${String(1000 + ((i * 271) % 9000)).padStart(4, '0')}`,
    joined: new Date(2022 + (i % 4), (i * 5) % 12, 1 + ((i * 3) % 27)),
    hours: 8 + ((i * 13) % 70),
    eventsAttended: 2 + ((i * 7) % 18),
    attendanceRate: 75 + ((i * 11) % 25),
  }
})

export const volunteersById = Object.fromEntries(volunteers.map((v) => [v.id, v]))

// v01 is Maureen (the volunteer persona); v02 is "John Doe" from the profile frames.
volunteers[0].name = 'Maureen Lee'
volunteers[1].name = 'John Doe'
volunteers[1].first = 'John'
volunteers[1].city = 'Washington, PA'
volunteers[1].email = 'johndoe@gmail.com'
volunteers[1].phone = '123-456-7890'
volunteers[1].joined = new Date(2023, 7, 12)
volunteers[1].hours = 67
volunteers[1].eventsAttended = 14
volunteers[1].attendanceRate = 92

export const initials = (name) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
