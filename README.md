# Ticket Booking Admin Frontend

React + Vite + Tailwind CSS admin dashboard for ticket booking management.

## Features
- Admin login page
- Event management page
- Seat overview page
- Booking dashboard page
- Transactions dashboard page

## Local setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```

## Notes
- This project includes frontend pages only.
- Connect the admin UI to your backend API via React fetch or Axios in the page components.

## Vercel deployment
1. Add the environment variable in Vercel:
   - `VITE_API_URL=https://ticket-booking-system-backend-q8gy.onrender.com`
2. The frontend uses `import.meta.env.VITE_API_URL` and falls back to `http://localhost:5000` locally.
3. Run `npm run build` in Vercel or locally to verify the production bundle.
