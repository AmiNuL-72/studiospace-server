# StudioSpace Server — Backend REST API

> **Live Server API:** [https://studiospace-server-as8.vercel.app/](https://studiospace-server-as8.vercel.app/)  
> **Client Live Website:** [https://studiospace-client-as8.vercel.app/](https://studiospace-client-as8.vercel.app/)

High-performance Express.js & MongoDB backend powering the **StudioSpace** peer-to-peer workspace sharing platform.

---

## 🌟 Key Backend Capabilities

- **Secure JWT via HTTPOnly Cookies (Challenge 1):** Tokens are set and cleared through HTTPOnly cookies (`sameSite`, `secure` flags enabled in production) eliminating client-side token exposure.
- **Double-Booking Overlap Prevention (Challenge 2):** MongoDB `$or` time query to guarantee no duplicate reservations overlap with existing Pending/Confirmed slots.
- **Role & Ownership Authorization:** Enforced middleware verifying that only listing owners can modify or delete studio entries and booking reservations.
- **Dynamic Studio Querying:** Full support for category filtering, title/location regex search, multi-field sorting (price, rating, date), and top-rated featured limits (`.limit(6)`).
- **Wishlist & Review Engines (Optional Features):** Dedicated MongoDB models to handle user favorites and rating/review aggregation.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Database:** MongoDB Atlas via Mongoose ODM
- **Authentication:** JWT (`jsonwebtoken`), `bcryptjs`, `cookie-parser`
- **Security:** `cors` with credentials support

---

## 🔌 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new creator account
- `POST /api/auth/login` — Authenticate and set HTTPOnly JWT cookie
- `POST /api/auth/google-login` — Google social login endpoint
- `POST /api/auth/logout` — Clear session cookie
- `GET /api/auth/me` — Verify authenticated session and return current user

### Studios (`/api/studios`)
- `GET /api/studios` — Get all studios (supports `?category=`, `?search=`, `?sortBy=`, `?limit=`)
- `GET /api/studios/featured` — Get top 6 featured spaces
- `GET /api/studios/:id` — Get single studio specifications and reviews
- `POST /api/studios` — Create studio listing *(Protected)*
- `PUT /api/studios/:id` — Update studio listing *(Protected, Owner only)*
- `DELETE /api/studios/:id` — Delete studio listing *(Protected, Owner only)*
- `GET /api/studios/owner/my-listings` — Get studios owned by authenticated user *(Protected)*
- `POST /api/studios/:id/reviews` — Add user review and recalculate studio rating *(Protected)*

### Bookings (`/api/bookings`)
- `POST /api/bookings` — Create a studio booking with double-booking prevention *(Protected)*
- `GET /api/bookings/my-bookings` — Get all bookings for the authenticated creator *(Protected)*
- `GET /api/bookings/:id` — Get single booking details *(Protected)*
- `PATCH /api/bookings/:id/cancel` — Cancel pending booking *(Protected, Creator only)*
- `PATCH /api/bookings/:id/status` — Update booking status to Confirmed/Completed *(Protected, Host only)*

### Wishlist (`/api/wishlist`)
- `POST /api/wishlist` — Save a studio to user wishlist *(Protected)*
- `GET /api/wishlist` — Get populated wishlist for current user *(Protected)*
- `DELETE /api/wishlist/:id` — Remove studio from wishlist *(Protected)*

---

## 🚀 Local Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/studiospace?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 3. Run Server
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

---

## 📄 License
StudioSpace Platform. All rights reserved.

