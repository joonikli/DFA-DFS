# Motion system: Dress for Success volunteer manager

This motion system is based on Emil Kowalski's guidance on interaction design ("7 practical animation tips" and "Great animations", emilkowal.ski). The tokens are in `styles.css` under `:root`. This file explains how and when to use them.

## Principles

1. **Every animation needs a reason.** Motion should explain a change: where something came from, what changed, or that the app received your input. If an animation doesn't explain anything, remove it.
2. **Frequent actions need less motion.** Bridget opens conversations, switches tabs and moves between pages many times a day, so these get little or no animation. Rare moments, like a report loading for the first time or a section being added, can have more.
3. **Fast by default.** UI motion stays under 300ms. Exits are faster than entrances.
4. **Use ease-out for anything the user triggers.** It starts fast, so the response feels immediate. Never use `ease-in` on UI.
5. **Animate only `transform` and `opacity`.** The two exceptions are disclosure rows (`grid-template-rows`) and a 2px blur that hides crossfades.
6. **Everything must be interruptible.** Use CSS transitions for state toggles so they can reverse mid-flight. Keyframes are only for one-off mount animations.
7. **Respect reduced motion.** Under `prefers-reduced-motion`, keep opacity fades and remove movement and scale.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` | Entering and exiting, any user-triggered change |
| `--ease-in-out` | `cubic-bezier(.77, 0, .175, 1)` | Something already on screen moving to a new place |
| `--ease-drawer` | `cubic-bezier(.32, .72, 0, 1)` | Side panels (thread, profile) |
| `--ease-toast` | `ease` | Toasts only: softer and a little slower, like Sonner |
| `--dur-press` | 100ms | Button press scale |
| `--dur-micro` | 150ms | Hover colour, toggles, tooltips, tab text colour |
| `--dur-pop` | 200ms | Popovers, menus, dropdowns, segmented thumb |
| `--dur-panel` | 250ms | Panels, new messages, new report sections |
| `--dur-exit` | 150ms | Every exit (about 0.75× the entrance) |
| `--dur-toast` | 400ms | Toast enter |

## Component rules

| Component | Enter | Exit | Notes |
|---|---|---|---|
| **Buttons, chips, reactions** | `:active` → `scale(.97)` over 100ms | — | Instant tactile feedback. Emoji buttons in the quick picker use `.9`. |
| **Popovers and menus** (Generate report, Export, channel, recipients, emoji picker, ⋮ menu) | `opacity 0→1`, `scale(.96→1)`, 200ms ease-out | 150ms | **Origin-aware**: `transform-origin` is set to the trigger's position. The Generate report panel grows from the top-right button, and the emoji picker grows up from the smiley. Never scale from 0. |
| **Escape key** | — | **Instant** | A popover closed from the keyboard disappears with no animation, because keyboard actions shouldn't animate. Clicking outside still fades it. |
| **Tooltips** | 125ms ease-out, `scale(.97)` | Instant | The first tooltip waits 500ms. Moving to a neighbouring tooltip within 400ms shows it instantly with no animation. |
| **Segmented controls** (Message/Announcements, reporting period, PDF/Web link) and **tab underline** | Thumb slides with `transform` over 200ms ease-out | — | Snaps into place with no animation on first render. |
| **Route changes** (Dashboard ↔ Messages ↔ Report) | 160ms opacity only | — | High-frequency, so there's no movement. |
| **Opening a conversation** | None | — | Very high-frequency, so the swap is instant. |
| **Sent message** | `translateY(8px) scale(.98)` → rest, 250ms, origin bottom-right | — | Shows where the message went. Its status changes from "Sending…" to a timestamp. |
| **Incoming reply** | Same as sent, origin bottom-left | — | Smooth-scrolls into view. |
| **New conversation in the list** | `translateY(-6px)` + fade, 250ms | — | |
| **Reaction count change** | The number slides in from above, 220ms | — | Only the digit animates, not the chip. |
| **Thread and profile panel** | `translateX(16px)` + fade, 250ms drawer ease | 150ms | |
| **Remove** (announcement, report section) | — | `scale(.98)` + fade, 150ms | Always paired with an Undo toast. |
| **Toasts** | Slide up from below, 400ms `ease` | 200ms, `scale(.98)` | Bottom-right, `aria-live="polite"`. |
| **Disclosure** (action items, action plan, Rewrite box) | `grid-template-rows 0fr→1fr`, 250ms | Same | The only layout animation in the system. |
| **Report first load** | Skeleton shimmer for about 1.1s, then sections fade up with a 50ms stagger and blur(2px)→0 | — | Rare and meaningful, so it gets a bit more motion. |
| **New report section from the composer** | Fades up and gets a 1.2s purple focus ring, then scrolls into view | — | Shows the cause and effect between chat and document. |
| **Section rewrite in progress** | Body dims to 35% with blur(2px) | Crossfades back | The blur hides the swap. |
| **Executive summary period change** | Text crossfade with a 2px blur | — | Emil tip #7: blur when nothing else works. |
| **Charts** | Line draws in (700ms), area fades in, bars grow from the baseline with a 30–40ms stagger | — | Only on first render or a range change, never on resize. The hover tooltip follows instantly. |
| **Event participation rows** | Row band + bar colour change on hover (150ms); tooltip glides between rows (`top`/`left` 150ms) instead of re-appearing | Fades 150ms | One tooltip element follows the pointer so moving down the list feels continuous. |
| **Grant progress, location bars, participation bars** | Grow from the left with `scaleX`, 600–700ms, staggered 30–35ms | — | First render only. |
| **Calendar day** | `:active` → `scale(.94)`; selected fill 150ms | — | Selecting a day swaps the event list instantly (frequent action); a newly added shift enters with the message-enter animation. |
| **Event row action** ("Message volunteers") | Fades in on row hover/focus, 150ms | — | Always visible on touch devices. |
| **Announcement hover toolbar** | Fades in and settles from `translateY(4px) scale(.98)`, 150ms ease-out, at the post's top right | Fades 150ms | Stays visible while its emoji picker or ⋯ menu is open; always visible on touch. |
| **Thread link** | Background and border fade in on hover (150ms), and "Last reply…" swaps to "View thread" | — | Same pattern as Slack's thread row. |
| **Hover effects** | Colour and background only, 150ms | — | Gated behind `@media (hover: hover) and (pointer: fine)`, so touch devices never get stuck hover states. |

## Don'ts

- Don't animate from `scale(0)`. Start at `.95` or higher.
- Don't use `ease-in` on anything the user triggers.
- Don't animate `height`, `width`, `top`, `left`, `margin` or `padding`, except for the single disclosure pattern above.
- Don't add entrance animations to things Bridget sees dozens of times a session, such as conversation switches, tab switches and list filtering.
- Don't let a decorative animation block input. Every transition can be interrupted.
