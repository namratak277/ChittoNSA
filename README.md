# Chhito! — The Climb to the Ballot

A live, Kahoot-style team quiz game for a Nepali student club. Teams "climb Mount Everest" through five checkpoints, answering questions on a projector + phones. The story teaches Nepali culture and, through the climb, how to prepare to vote in the U.S. It ends with every player making a personal voting plan.

Brand: **Chhito!** (छिटो!, Nepali for "quick!"). Motto: *Think fast. Climb fast. Vote.*

The `design-reference/` folder contains the approved mockups (one file per screen). They are written in a custom mockup format — **do not run them or copy their framework**. Use them as the visual source of truth: layout, copy, colors, sizes, and the inline SVG drawings (mountain, prayer flags, climbers, logo), which can be copied directly into components.

---

## 1. Non-negotiables

- **Nonpartisan.** Never ask, store, or display who anyone votes for, or any party or candidate. The voting content is only about *how to prepare to vote* (registration, polling place, deadlines, backup options).
- **Players never need an account.** Players join with a 6-digit game PIN + nickname. Only game makers have accounts.
- **Privacy.** Store no personal info about players beyond nickname and team. For voting plans, the server stores only *that a plan was made* (a boolean count), never the plan's content. The plan stays on the player's phone.
- **No elimination.** Wrong answers never cost points or knock a team out.
- **Official info only.** Link to vote.gov and the NC State Board of Elections (ncsbe.gov). Leave any date/deadline as a placeholder for the host to fill in; never hardcode election dates.
- **Nepali text must render correctly** (Devanagari). Use fonts that support it (below).

## 2. Three kinds of screens (same web app, different routes)

| Route | Who | Designed for | Auth |
|---|---|---|---|
| `/play` (and `/play/:pin` from the QR code) | Players | Phone first (390px wide), also works on laptop | None — anonymous session |
| `/host/:pin` | Host, on the projector | 16:9 landscape, 1280×720 baseline, scales up | Maker account |
| `/maker/*` | Game makers | Laptop dashboard | Maker account |

Decide what to show by **route and role, not device detection**. If `/host` is opened on a narrow screen, show a notice: "Open this on a laptop connected to the projector."

## 3. Game flow (server-controlled state machine)

The server owns the game state; the host's clicks advance it and every phone switches at the same moment via realtime updates.

```
LOBBY (Welcome to Base Camp)
 → SUPPLY_SHOP            Checkpoint 1: Base Camp — build your expedition
 → QUESTION → REVEAL      repeats per question, grouped by checkpoint
 → STORM_EVENT            Checkpoint 3: Storm Zone — event card, host-scored
 → QUESTION → REVEAL      Checkpoint 4: Final Ascent
 → RESULTS                Summit Champions (team points)
 → VOTING_PLAN + DEBRIEF  Checkpoint 5: Summit to the ballot
 → ENDED
```

The five checkpoints are the mountain stops, in order: **Base Camp → Route Checkpoint → Storm Zone → Final Ascent → Summit**.

| # | Checkpoint | What teams do | Voting lesson shown after |
|---|---|---|---|
| 1 | Base Camp | Spend 10 supply points, then answer "Before Election Day, what should you check first?" | Check your registration status and eligibility |
| 2 | Route Checkpoint | Three info cards (official / outdated / unverified social post): pick the one to trust | Know where to find official info on locations, hours, deadlines |
| 3 | Storm Zone | Surprise event card, 2 minutes to discuss, one person explains the plan. Host awards points | If your plan falls through, check official sources for alternatives (early voting, mail, new location) |
| 4 | Final Ascent | Final scenario: one day left, explain your full plan and backup | A complete plan = when, how, requirements, where to check updates |
| 5 | Summit | Everyone fills in a personal voting plan on their phone; host leads debrief | "You planned your climb. Now plan your vote." |

Nepali culture questions ("trail questions", e.g. "Dashain lasts how many days?") are mixed into checkpoints 2–4 and each reveal shows a short **trail fact**.

## 4. Teams

- Default 5 teams. A player's **flag color = their team**:
  - Blue `#1D4ED8` — Summit Seekers
  - White `#FFFFFF` — Snow Leopards
  - Red `#DC2626` — Himalayan Heroes
  - Green `#16A34A` — Team Sagarmatha
  - Yellow `#F2B705` — Momo Mountaineers
- The host can set 4, 5 or 6 teams in Host setup. Show team member counts in the lobby.
- Each player also picks a **climber style** (Topi buddy or Headlamp climber) — see design.
- On the mountain, show **one climber marker per team**, positioned by team points.

## 5. Two answer modes (host picks in Host setup)

**Buttons mode** — every team answers each question (any member taps; first tap from a team locks that team's answer). Correct = +10 points. Speed bonus up to +5 (faster = more). 20-second default timer.

**Buzzer mode** — each phone shows a quick puzzle: tap the five prayer flags in the traditional order (Blue/sky → White/air → Red/fire → Green/water → Yellow/earth). The order teams finish = the order they answer. 1st team gets 10 seconds; right = +10; wrong = no penalty, next team's turn. Host has "Right → reveal" and "Wrong → next team" controls. The server records finish order (use server receive time, not client clocks).

## 6. Scoring (team scorecard)

| Achievement | Points |
|---|---|
| Correct checkpoint answer | 10 |
| Explains its reasoning (host-awarded) | 5 |
| Makes a practical backup plan (host-awarded) | 5 |
| Good teamwork (host-awarded) | 5 |
| Completes the Final Ascent | 10 |
| Speed bonus (Buttons mode only) | up to 5 |
| Base Camp prep bonus (good supplies + correct answer) | 5 |

Host-awarded points come from tap buttons on the Storm screen (+10 plan, +5 backup, +5 team). Most points at the end = **Summit Champions**.

## 7. Supply shop (Checkpoint 1)

Budget: 10 points per team. Items:

| Item | Cost | Helps with |
|---|---|---|
| Trail map | 3 | Know the route |
| Warm layers | 3 | Survive the cold |
| Weather radio | 2 | Hear about changes |
| Extra food | 2 | Keep your energy |
| Emergency kit | 3 | For the unexpected |
| Rope + ice axe | 4 | For steep sections |

One phone per team locks in the team's supplies; can't exceed budget. Storm event cards can reward relevant supplies (e.g. weather radio = +5 on a weather event). Store each team's supply list.

## 8. Screens to build (match `design-reference/`)

Host (projector): `Main` (Welcome to Base Camp: PIN, QR, interactive 5-step rules, teams list) · `Host-Supplies` · `Mountain` (question on the mountain, prayer-flag answers) · `Host-Reveal` · `Host-Buzzer` · `Host-Storm` · `Host-Summit` (Summit Champions) · `Host-Pledge` (Summit to the ballot + debrief questions + plans-made count).

Player (phone): `C-Phone` (join: PIN, nickname, team/flag color, climber) · `Phone-Supplies` · `Ans-Sign-Phone` (answer with trail signposts + result) · `Phone-Buzzer` (puzzle → buzz order → answer) · `Phone-Summit` (final team rank) · `Phone-Pledge` (My voting plan).

Maker (laptop): `Maker-SignIn` (sign in / create account) · `Maker-Dashboard` (My games) · `Maker-Builder` (question builder) · `Maker-Host` (Host setup: mode, timer, teams → Open Base Camp).

Overviews: `Story` (story, checkpoints, schedule, scorecard, debrief), `Flow`, `Modes`, `Player-Markers`, `Brand-4`.

### Answer presentation (important — deliberately NOT Kahoot-style tiles)
- **Projector:** four **prayer flags** hanging from a rope, labeled with Nepali letters **क ख ग घ** (used like A B C D), colors blue/red/green/yellow, ragged cloth bottom edge, slight tilt.
- **Phone:** four **trail signposts** (arrow-shaped boards on one wooden post) with the same letter + color as the matching flag.
- **Reveal:** wrong flags fade to 30% opacity; the correct flag straightens, enlarges, shows a check and team count.

## 9. Design system

- **Fonts:** Baloo 2 (500/700/800) for all UI — supports Latin + Devanagari. Yatra One for big Nepali display words (e.g. छिटो!). Load from Google Fonts.
- **Colors:**
  - Prayer flags / teams: blue `#1D4ED8`, white `#FFFFFF`, red `#DC2626`, green `#16A34A` (use `#15803D` behind white text), yellow `#F2B705` (always dark text on yellow)
  - Brand (Chhito!): marigold `#F2B705`, chili `#E23D28`, pine `#0E7C5A`, cream `#FFF6DC`
  - Ink `#1E1B2E`, body grey `#4A4660`, page cream `#FFFDF8`, maker dashboard bg `#F6F4EE`
  - Mountain (light glacier): lit face `#A9C8F7`, shadow face `#7FA6EC`, deep fold `#6F9BE8`, foothills `#8FB2EF`, haze `#E3EDFC`, sun `#FFF1C2` (sun sits on the **left**, the lit side)
- **Shapes:** chunky 3px ink borders, 14–24px radii, offset ink shadows on key cards. A prayer-flag stripe (blue/white/red/green/yellow) runs across the top of every phone screen.
- **Player markers (final):**
  - *Topi buddy* — round light-blue badge `#EAF0FD`, white face with eyes, smile and rosy cheeks, scarf, patterned Dhaka topi in the team color.
  - *Headlamp climber* — night-sky circle `#2A3F7A`, helmet + jacket in team color, headlamp beam, stars.
  - Copy the SVGs from `Player-Markers` in design-reference.
- **Maker screens** look like a work tool (dark side bar or top bar, white panels, smaller text). **Player screens** are big, playful, phone-first.

## 10. Accessibility & phones

- Tap targets ≥ 44px; real `<button>`/`<a>`/`<input>` with labels; text contrast ≥ 4.5:1.
- Never rely on color alone: answers always carry the letter क/ख/ग/घ; flags/signs keep their shapes.
- Keep the screen awake during questions (Wake Lock API where supported).
- Short vibration on buzz-in (`navigator.vibrate`, optional).
- **Auto-reconnect:** store the player's session token in localStorage; reopening the link rejoins the same team/climber.
- Test on iPhone Safari and Android Chrome.

## 11. Suggested stack

- **Next.js (React, TypeScript)** + **Tailwind CSS**
- **Supabase**: Auth (makers only, email + Google), Postgres, Realtime channels for live game state. Players use anonymous sessions tied to a PIN.
- Hosting: **Vercel** (free tier).
- QR code: a small client-side QR library.

## 12. Data model (starting point)

- `makers` (from Supabase Auth)
- `games` — id, maker_id, title, default_mode, created_at
- `checkpoints` — id, game_id, order (1–5), name, voting_lesson
- `questions` — id, game_id, checkpoint_id, order, type (`multiple_choice` | `info_cards` | `storm_event` | `final_scenario`), prompt, options[4] (for MC), correct_index, trail_fact, timer_seconds, topic (`nepal` | `voting`)
- `storm_cards` — id, game_id, title, body, helpful_supply
- `sessions` — id, game_id, pin (6 digits, unique while live), mode (`buttons` | `buzzer`), state, current_question_id, team_count, started_at
- `teams` — id, session_id, name, color, points, supplies[]
- `players` — id, session_id, team_id, nickname, climber_style (`topi` | `headlamp`), session_token, joined_at
- `answers` — id, session_id, question_id, team_id, player_id, option_index, received_at, correct, points_awarded
- `buzz_order` — session_id, question_id, team_id, position, received_at
- `awards` — session_id, team_id, reason (`plan` | `backup` | `teamwork` | `prep`), points
- `voting_plan_count` — session_id, count (increment only; no plan content)

Use row-level security: makers can only read/write their own games; players can only write answers/buzzes for their own team in a live session.

## 13. Build order (one milestone at a time; commit after each)

1. Project setup, design tokens (colors, fonts), shared components: PrayerFlagStripe, Mountain (SVG), FlagAnswer, SignpostAnswer, ClimberMarker (topi/headlamp), Card, Button.
2. Static screens matching design-reference with fake data (all routes clickable).
3. Supabase schema + maker auth + My games + Question builder (save/load).
4. Live sessions: create PIN, player join (anonymous), team pick, lobby updates in realtime.
5. Game state machine + host controls; Buttons mode answering, scoring, reveal.
6. Supply shop.
7. Storm event + host scorecard awards.
8. Buzzer mode (puzzle, server-side finish order, turn passing).
9. Results, voting plan (local only + count), debrief screen.
10. Reconnect, wake lock, accessibility pass, phone testing, deploy to Vercel.

## 14. Placeholders the host fills in (never invent values)

`[CLUB NAME]`, `[GAME URL]`, `[PRIZE]`, `[NC REGISTRATION DEADLINE]`, `[ELECTION DATE]`, `[CLUB INSTAGRAM]`. Make these editable in Host setup or a settings file.

## 15. Content still being written

Final question set, Base Camp answer choices, Route Checkpoint info cards, extra storm cards, and the Final Ascent scenario. Seed the database with the sample content from the mockups (Dashain question, "trail closed" storm card) and keep content in a seed file (`/content/seed.json`) so it's easy to edit.

## 16. Decisions (agreed with the project owner; these override the mockups where they differ)

- **Stack:** npm, Next.js App Router, TypeScript, Tailwind v4 (tokens in `src/app/globals.css` via `@theme`). App lives at the repo root; mockups in `design-reference/`.
- **6 teams:** the 6th team is orange `#EA580C`, name `[TEAM 6 NAME]` (placeholder for the host). **4 teams:** drop Momo Mountaineers (yellow).
- **Team marker style** = the climber style of the first player who joined that team.
- **Markers on the mountain:** teams group side by side at checkpoint stops, and move smoothly along the trail to the next checkpoint when they advance (driven by points).
- **Base Camp prep bonus** is shown as a "+5 supply token" (worth 5 points).
- **Route Checkpoint info cards:** the layout adapts to the number of cards (e.g. 3 flags/signposts instead of 4).
- **Final Ascent** is scored by the host; every team automatically gets +10 for completing it.
- **Copy:** everything is team-based. Use "points" (not metres), "most points wins" (not first to summit), "voting plans made" (not "pledged"), team winners only (no individual winner).
- **Phone end screen stats** are team stats (team correct answers, team best streak), not personal.
- **Database:** SQL lives in `supabase/migrations/` (run in number order in the Supabase SQL Editor). Questions carry a `checkpoint` number (1–4) instead of a `checkpoints` table; checkpoint names and voting lessons come from `src/lib/checkpoints.ts`. Storm cards are their own table. The voting-plan count is `sessions.voting_plans`. Maker pages talk to Supabase from the browser with the anon key, protected by row-level security; player writes go through checked database functions.
- **Game state:** the host's buttons call `host_*` database functions; phones follow the `sessions` row over Realtime. Phones see the question through `sessions.public_question`, which gets the right answer only at the reveal. Answers are scored when they arrive (server clock), but points are added to teams at the reveal so the scoreboard never gives the answer away. Questions play in checkpoint order, then builder order.
- **Mountain markers:** the leading team stands at the checkpoint the game has reached (Summit only at the results); other teams stand in proportion to their points.
- **Timer:** in Buttons mode the host can force one timer for every question, or leave "Each question's own timer" (stored as `timer_seconds = 0`).
- **Night order:** Lobby → supply shop → Checkpoint 1–3 questions → Storm Zone (first storm card; the host can draw more) → Checkpoint 4 questions (Final Ascent) → Summit Champions → voting plan + debrief → end.
- **Supply shop:** each team shares one pack that any teammate can edit; one phone locks it in. The shop timer shows 5 minutes, but the host closes the shop; closing it locks every team's pack.
- **Base Camp prep bonus:** +5 supply token for a team that used at least 8 of its 10 supply points and got a Checkpoint 1 question right (once per team).
- **Storm cards:** a team that packed the card's helpful supply gets +5 automatically when the card is drawn. Teams get 2 minutes to plan.
- **Host scorecard** (Storm Zone and final scenarios): +10 plan, +5 why (explains its reasoning), +5 backup, +5 team. "Reset this round" takes back this screen's taps.
- **Final Ascent:** a final-scenario question is talked through (no answer buttons); every team gets +10 at its reveal.
- **Buzzer mode:** finish order comes from the server. The team whose turn it is answers on their phones; the projector shows what they picked (and whether it's right) so the host can tap Right → reveal or Wrong → next team.
- **Host settings:** the [PLACEHOLDERS] are filled in on Host setup, saved with each session (and remembered on that laptop). Blank fields keep the placeholder.
- **Club and place:** the club is UNCG Nepalese Student Association (Instagram @uncgnsa), set as defaults in `content/seed.json`. Voting info is for Greensboro, NC (Guilford County) and links only to official tools: the NC State Board of Elections lookups on ncsbe.gov (registration, polling place, early voting sites, vote by mail, voter ID, county boards), which work for every NC county, and vote.gov for players registered in another state. The link list lives in `NC_VOTING_LINKS` in `src/lib/settings.ts`. Dates and deadlines stay placeholders for the host.
- **Voting plan** is saved only in the phone's localStorage; the server only counts that a plan was made.

## 17. Setup and deploy

1. **Supabase:** create a project, then run every file in `supabase/migrations/` in number order (SQL Editor → New query → paste → Run).
2. **Keys:** copy `.env.local` values from Supabase → Project Settings → API: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. (`SUPABASE_SERVICE_ROLE_KEY` isn't used by the app.)
3. **Local:** `npm install`, then `npm run dev` and open http://localhost:3000.
4. **Auth URLs:** in Supabase → Authentication → URL Configuration, set the Site URL to your live address and add `http://localhost:3000/**` and `https://<your-site>/**` to Redirect URLs. For Google sign-in, turn on the Google provider there too.
5. **Vercel:** import the GitHub repo, add the two `NEXT_PUBLIC_SUPABASE_*` environment variables, deploy. Put the short address in Host setup → Game address.
6. **Before the night:** play a full test game with two phones (iPhone Safari and Android Chrome), one per team. (no button for it in the mockups yet).
