NEMO RESTAURANT ACTIVITY RADAR — V2

WHAT CHANGED
- Still ZERO rider-location input in the restaurant score.
- Adds automatic restaurant popularity observations from Google Places API (New).
- Uses official Nearby Search ranked by POPULARITY.
- Captures:
  * rank around each monitored area
  * open now
  * business status
  * rating
  * review count
  * delivery support when Google provides it
  * takeout support
  * current/regular opening-hour descriptions
- Inserts a fresh snapshot into restaurant_market_signals.
- Existing radar page consumes the recent snapshots automatically.
- Dashboard wording is now "Market Signal", not "HungerStation Signal", so it does not misrepresent Google data as HungerStation data.

FILES
1) Replace:
   app/employees/restaurant-demand/page.tsx

2) Add:
   app/api/restaurant-demand/collect-google/route.ts

3) Read:
   .env.restaurant-radar.example
   vercel-cron-snippet.txt

PREREQUISITES
- Run restaurant_market_signals.sql from V1 if you have not already.
- Enable Places API (New) in Google Cloud.
- Add GOOGLE_MAPS_API_KEY to .env.local and Vercel.
- Add SUPABASE_SERVICE_ROLE_KEY server-side only.
- Add RESTAURANT_RADAR_CRON_SECRET.

LOCAL TEST
With npm run dev running, if NODE_ENV is not production and no radar secret is configured, open:
http://localhost:3000/api/restaurant-demand/collect-google

You should receive JSON containing:
ok: true
inserted: ...
areas: [...]

Then open:
http://localhost:3000/employees/restaurant-demand

IMPORTANT
Google "POPULARITY" is a general place-popularity ranking, not live HungerStation order count.
It is useful as an independent market-activity signal.

HUNGERSTATION TOP-LIST
The database remains ready for a separate public/authorized HungerStation observation source.
Do not label Google rankings as HungerStation rankings.

MONITORED RIYADH AREAS
النرجس، الياسمين، الملقا، الصحافة، الربيع، الغدير، العقيق، حطين،
قرطبة، غرناطة، اليرموك، اشبيلية، الروضة، السليمانية، العليا، الملز.
