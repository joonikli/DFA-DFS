// Volunteer-side messaging seed (Maureen's inbox). Same people as the notifications panel and the
// dashboard announcement, so every entry point lands on something real.
//
// Channel logic, from the volunteer's side: everything lives here in the app. A message a coordinator
// also emailed is marked "Also sent to your email" (email is a route, not a separate inbox).
// Volunteers message coordinators and reply in groups they were added to; only coordinators post
// announcements and start group chats.
import annaClaire from '../assets/people/anna-claire.png'
import madison from '../assets/people/madison-f.png'
import kyla from '../assets/people/kyla.png'
import mariko from '../assets/people/mariko-takahashi.png'
import sarahDoe from '../assets/people/sarah-doe.png'
import johnDoe from '../assets/people/john-doe.png'

export const PEOPLE = {
  me: { name: 'Maureen Lee', first: 'Maureen' },
  bridget: { name: 'Bridget Moore', first: 'Bridget', role: 'Volunteer Manager', staff: true },
  mariko: { name: 'Mariko Takahashi', first: 'Mariko', role: 'Warehouse Wednesday lead', staff: true, photo: mariko },
  anna: { name: 'Anna Claire', first: 'Anna', role: 'Program Coordinator', staff: true, photo: annaClaire },
  kyla: { name: 'Kyla Brooks', first: 'Kyla', role: 'Fill-A-Bag Coordinator', staff: true, photo: kyla },
  madison: { name: 'Madison Foster', first: 'Madison', role: 'Volunteer', photo: madison },
  sarah: { name: 'Sarah Doe', first: 'Sarah', role: 'Volunteer', photo: sarahDoe },
  john: { name: 'John Doe', first: 'John', role: 'Volunteer', photo: johnDoe },
}

export const STAFF = Object.keys(PEOPLE).filter((id) => PEOPLE[id].staff)

// How coordinators reach Maureen. Feeds the manager composer's suggested channel.
export const REACH_PREFS = {
  missed: ['App, and email me what I miss', 'Messages arrive here. If you haven’t seen one after an hour, we email it to you.', 'what I miss'],
  all: ['App and email for everything', 'Every message and announcement is also sent to maureen.lee@gmail.com.', 'everything'],
  app: ['App only', 'Nothing is emailed. You’ll only see messages when you open Dress for Success.', 'off'],
}

const m = (id, from, day, time, text, extra = {}) => ({ id, from, day, time, text, reacts: {}, replies: [], ...extra })

export const seedMessages = {
  reachPref: 'missed',
  convos: [
    {
      id: 'c-bridget', who: ['bridget'], unread: 1, last: 'Today', msgs: [
        m('b1', 'bridget', 'Monday', '4:12 PM', 'Hi Maureen! Thanks for signing up for Mobile Services on May 26. Pickup is at the Downtown Career Center at 1:45, and the van leaves at 2 sharp.', { emailed: true, subject: 'Your Mobile Services shift on May 26' }),
        m('b2', 'me', 'Monday', '6:30 PM', 'Thank you! Is there parking nearby, or should I take the bus?', { status: 'seen' }),
        m('b3', 'bridget', 'Monday', '6:41 PM', 'There’s a garage on Penn Ave. Bring your ticket and we’ll validate it.', { reacts: { '🙏': ['me'] } }),
        m('b4', 'bridget', 'Today', '8:02 AM', 'Here’s the shift again so you have the details handy.', { event: 'e12' }),
      ],
    },
    {
      id: 'c-cleanup', name: '11/4 Cleanup committee', who: ['anna', 'madison', 'sarah', 'john'], addedBy: 'anna', unread: 2, last: '2h ago', msgs: [
        m('k1', 'anna', 'Last week', 'Thu 10:15 AM', 'Hey guys! This will be the group chat for our clean up committee. Please introduce yourselves!'),
        m('k2', 'sarah', 'Last week', 'Thu 11:02 AM', 'Hi all, I’m Sarah. I usually help at the Boutique on Saturdays.', { reacts: { '👋': ['anna', 'me'] } }),
        m('k3', 'me', 'Last week', 'Thu 12:20 PM', 'Hi everyone, Maureen here! Quick question: what should we wear for the cleanup?', {
          status: 'seen',
          replies: [{ who: 'madison', time: 'Fri 9:10 AM', text: 'I think you can bring a set of work clothes from the bins by the front desk.' }],
        }),
        m('k4', 'john', 'Today', '7:40 AM', 'Morning! I can bring extra gloves for anyone who needs them.'),
        m('k5', 'anna', 'Today', '7:55 AM', 'Thanks John! We’ll meet by the loading dock at 9.'),
      ],
    },
    {
      id: 'c-mariko', who: ['mariko'], unread: 0, last: 'Sat', msgs: [
        m('r1', 'me', 'Saturday', '11:04 AM', 'Hi Mariko, does a work badge count as ID for check-in?', { status: 'seen', reAnn: 'Warehouse Wednesday announcement' }),
        m('r2', 'mariko', 'Saturday', '11:30 AM', 'Yes, any photo ID works. See you Wednesday!'),
      ],
    },
  ],
  groups: [
    {
      id: 'g-ww', name: 'Warehouse Wednesday crew', count: 31, unread: 1, last: 'Sat', anns: [
        { id: 'ann-0', from: 'mariko', day: 'May 6', time: '9:00 AM', title: 'June shifts are open', body: 'June Warehouse Wednesday shifts are now open. We sort and tag donated workwear from 2 to 5 PM. Grab a spot while there’s room!', reacts: { '🙌': 9, '👍': 14 }, mine: [], replyMode: 'thread', replies: [{ who: 'sarah', time: 'May 6', text: 'Signed up for the 10th!' }] },
        { id: 'ann-1', from: 'mariko', day: 'Saturday', time: '10:30 AM', title: 'Warehouse Wednesday announcement', body: 'For everyone who is attending the Warehouse Wednesday event next week, please remember to bring your ID or some form of identification so we can check you in at the entrance! This is a safety precaution to make sure that everyone will have a comfortable experience. Thank you for your cooperation and sorry for any inconvenience.', reacts: { '👍': 17, '❤️': 6 }, mine: [], replyMode: 'private', replies: [] },
      ],
    },
    {
      id: 'g-mobile', name: 'Mobile Services volunteers', count: 23, unread: 1, last: 'Yesterday', anns: [
        { id: 'ann-2', from: 'bridget', day: 'Yesterday', time: '3:15 PM', title: 'New pickup stop on the May 26 route', body: 'We’ve added a stop at the Allegheny shelter, so the route now ends around 5:15 instead of 5. If that’s a problem for anyone, let me know and we’ll sort it out.', reacts: { '👍': 11 }, mine: [], replyMode: 'thread', replies: [{ who: 'john', time: 'Yesterday', text: 'Works for me.' }, { who: 'sarah', time: 'Yesterday', text: 'I might need to leave at 5, is that okay?' }, { who: 'bridget', time: 'Yesterday', text: 'Totally fine, Sarah. We’ll drop you first.' }] },
      ],
    },
    {
      id: 'g-fab', name: 'FAB Crew', count: 18, unread: 0, last: 'May 13', anns: [
        { id: 'ann-3', from: 'kyla', day: 'May 13', time: '5:00 PM', title: 'Arrive 15 minutes early', body: 'Reminder: Fill-A-Bag volunteers should arrive 15 minutes early for setup. Coffee is on us!', reacts: { '☕': 8, '👍': 12 }, mine: ['👍'], replyMode: 'thread', replies: [] },
      ],
    },
  ],
}

// Canned replies so the prototype answers back
export const AUTO_REPLIES = {
  bridget: ['Got it, thanks Maureen!', 'Good question. I’ll check and get back to you today.', 'Perfect, see you then!'],
  mariko: ['Thanks for letting me know!', 'Yes, that works. See you Wednesday!'],
  anna: ['Thanks Maureen! I’ll pass that along.', 'Sounds great!'],
  kyla: ['Thank you! See you at Fill-A-Bag.', 'Got it!'],
}
