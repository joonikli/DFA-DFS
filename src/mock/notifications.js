// Seed notifications for the bell panel (Figma: Final › Notification › Example/context, 2324:48413).
// `parts` are rich-text runs: [text, bold].
import annaClaire from '../assets/people/anna-claire.png'
import madison from '../assets/people/madison-f.png'
import kyla from '../assets/people/kyla.png'
import awardStar from '../assets/award-star.png'

export const seedNotifications = {
  volunteer: [
    {
      id: 'n1',
      variant: 'default',
      image: annaClaire,
      parts: [['Anna Claire (Admin)', true], [' added you to ', false], ['11/4 Cleanup', true]],
      preview: '“Hey guys! This will be the group chat for our clean up committee. Please introduce yourselves!”',
      time: '2h ago',
      category: 'Messages',
      unread: true,
    },
    {
      id: 'n2',
      variant: 'default',
      image: awardStar,
      parts: [['Congrats! We granted you a ', false], ['volunteer award', true], [' for your recent attendance at ', false], ['Fill-A-Bag', true]],
      time: '12h ago',
      category: 'Event',
      unread: true,
    },
    {
      id: 'n3',
      variant: 'success',
      parts: [['You', true], [' successfully registered for the event ', false], ['Mobile Services', true]],
      time: '2 days ago',
      category: 'Event',
      link: { label: 'Mobile Services', detail: 'May 26', to: '/events?tab=registered' },
    },
    {
      id: 'n4',
      variant: 'default',
      image: madison,
      parts: [['Madison F. (Volunteer)', true], [' replied to your thread', false]],
      preview: '“I think you can bring a set of work clothes from the bins by the front desk.”',
      time: '1 week ago',
      category: 'Messages',
    },
    {
      id: 'n5',
      variant: 'default',
      image: kyla,
      parts: [['Kyla (Admin)', true], [' sent an announcement to ', false], ['FAB Crew', true]],
      preview: '“Reminder: Fill-A-Bag volunteers should arrive 15 minutes early for setup.”',
      time: '1 week ago',
      category: 'Messages',
    },
  ],
  admin: [
    {
      id: 'a1',
      variant: 'success',
      parts: [['Maureen', true], [' registered for ', false], ['Mobile Services', true]],
      time: '2h ago',
      category: 'Event',
      unread: true,
      link: { label: 'Mobile Services', detail: 'May 26', to: '/events' },
    },
    {
      id: 'a2',
      variant: 'alert',
      parts: [['PNC Foundation', true], [' report is due in ', false], ['5 days', true]],
      preview: 'Submit the impact report before September 30.',
      time: '5h ago',
      category: 'Event',
      unread: true,
    },
    {
      id: 'a3',
      variant: 'default',
      image: madison,
      parts: [['Madison F. (Volunteer)', true], [' submitted the ', false], ['Fill-A-Bag survey', true]],
      preview: '“The stylists were wonderful — more sizes would help.”',
      time: '1 day ago',
      category: 'Event',
    },
    {
      id: 'a4',
      variant: 'default',
      image: kyla,
      parts: [['Kyla (Admin)', true], [' sent an announcement to ', false], ['FAB Crew', true]],
      preview: '“Reminder: Fill-A-Bag volunteers should arrive 15 minutes early for setup.”',
      time: '1 week ago',
      category: 'Messages',
    },
  ],
}
