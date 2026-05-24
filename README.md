# Klyro

Klyro is a full-featured React SPA that brings together a game library, community feed, real-time chat, personalized recommendations, and a freemium subscription model — all wrapped in a dark, polished UI.

---

## Інформація про проєкт

|                       |                                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| **Автор**             | Федонюк Анатолій Миколайович                                                                          |
| **Тема роботи**       | Розробка веб-додатку соціальної мережі для геймерів з використанням гібридної рекомендаційної системи |
| **Науковий керівник** | Яковлєв Микола Костянтинович                                                                          |
| **Посада керівника**  | Senior JavaScript Developer, Intellias                                                                |

---

## Features

### Game Library & Discovery

Browse and search a large game catalog. Each game detail page shows cover art, rating, Metacritic score, genres, platforms, available stores, tags, and a full screenshot gallery with a keyboard-navigable lightbox.

### Reviews

Write star-rated reviews directly on a game's page. View community reviews inline and browse all your past reviews from your profile's **Reviews** tab.

### Collections

Organise games into themed, customisable collections with colour accents and icons. Free accounts can create up to **3 collections**; Premium unlocks unlimited collections.

### Social Feed

Post activity updates, tag games in posts, and interact with the community through likes and comments. The home feed shows posts from people you follow alongside a personalized recommendations sidebar.

### Trending

See what's hot right now: the most popular games by reviews and ratings, and the most liked community posts of the week — with live stats cards for hot topics, active users, and new releases.

### User Profiles & Social Graph

Follow and unfollow other users, browse their **Followers / Following / Friends** lists, view their favourite games and activity posts, and navigate to any profile directly from connection modals.

### Real-time Chat

WebSocket-powered direct messaging. Conversations are persisted locally, rooms are joined/left automatically, and a live presence indicator shows connection status.

### Smart Recommendations

A recommendation engine surfaces games tailored to your play history, favourites, and reviews. Each card shows a **match confidence score**. Free users preview the first 6 results; Premium users see the full personalised list.

### Authentication

Email/password login, OTP email verification, forgot password, and password reset flows. JWT access tokens are stored in `localStorage` with a transparent silent refresh strategy — failed requests are automatically retried after a token refresh.

### Premium Subscription

Upgrade to Premium from the **Plans & Pricing** page to unlock unlimited collections, advanced recommendations, profile customisation, and an exclusive badge. Cancel any time; access continues until the billing period ends.

---

## Tech Stack

| Layer       | Technology                                                  |
| ----------- | ----------------------------------------------------------- |
| Framework   | React 19                                                    |
| Language    | TypeScript 5                                                |
| Build tool  | Vite 7                                                      |
| Styling     | Tailwind CSS v4                                             |
| Routing     | React Router v7 (lazy code-split routes)                    |
| Animations  | Framer Motion 12                                            |
| HTTP client | Axios (request/response interceptors, silent token refresh) |
| Real-time   | Socket.IO client v4                                         |
| Forms       | React Hook Form v7                                          |
| Icons       | React Icons v5                                              |
| CI/CD       | GitHub Actions → GitHub Pages                               |

---

## Project Structure

```
src/
├── api/              # All API calls (auth, games, posts, collections, reviews, …)
├── components/
│   ├── Collections/  # Create / Edit / AddGames modals
│   ├── Feed/         # Feed, FeedItem, FeedComposer, TagGameModal
│   ├── Game/         # ReviewsSection, ReviewForm, ReviewCard, AddToCollectionModal
│   ├── Profile/      # ProfileHeader, ProfileTabs, ProfileReviewCard, ConnectionsModal, EditProfileModal
│   ├── Search/       # UserRow
│   ├── Sidebar/      # Sidebar, SidebarItem
│   └── ui/           # Button, Card, Input, InputOTP* primitives
├── config/
│   ├── api.ts        # Axios instance + auth interceptors
│   └── collectionsConfig.ts  # Icon/colour maps for collections
├── contexts/
│   └── AuthContext.tsx  # Global auth state + refreshUser
├── hooks/
│   ├── useProfileUser.ts    # Resolves own vs. external profile + follow state
│   └── useProfileReviews.ts # Loads reviews for a profile
├── pages/            # One file per route (Home, GameDetail, Collections, Chat, …)
├── routes/
│   └── router.tsx    # createBrowserRouter with lazy imports + RequireAuth guard
├── types/
│   └── user.type.ts  # User, Plan, SubscriptionStatus types
└── utils/            # renderStars, subscriptionUtils, localStorage helpers, regex
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Yarn** (the project uses `yarn --frozen-lockfile` in CI)

### Installation

```bash
git clone https://github.com/Executor-create/klyro-app.git
cd klyro-app
yarn
```

### Development

```bash
yarn dev
```

The app starts at `http://localhost:5173` by default.

### Production build

```bash
yarn build
yarn preview
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:3000
```

| Variable            | Description                                     | Default                 |
| ------------------- | ----------------------------------------------- | ----------------------- |
| `VITE_API_BASE_URL` | Base URL of the backend REST + WebSocket server | `http://localhost:3000` |

> The app connects to this URL for all API calls **and** for the Socket.IO real-time chat connection.

---

## Deployment

The project ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically builds and deploys to **GitHub Pages** on every push to `main`.

```
push to main → yarn install → vite build → upload dist/ → deploy to GitHub Pages
```

The Vite config sets `base: '/klyro-app/'` in production so all asset paths resolve correctly under the GitHub Pages sub-path.

To deploy manually, run `yarn build` and serve the `dist/` folder from any static host.

---

## Free vs. Premium

| Feature               | Free            | Premium                |
| --------------------- | --------------- | ---------------------- |
| Game library & search | ✅              | ✅                     |
| Write & read reviews  | ✅              | ✅                     |
| Social feed & posts   | ✅              | ✅                     |
| Real-time chat        | ✅              | ✅                     |
| Trending page         | ✅              | ✅                     |
| Collections           | Up to 3         | Unlimited              |
| Recommendations       | First 6 results | Full personalised list |
| Premium badge         | ❌              | ✅                     |
| Profile customisation | Basic           | Advanced               |

---

## License

This project is private. All rights reserved.
