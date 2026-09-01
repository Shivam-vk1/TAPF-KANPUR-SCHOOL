# MDM Route Finder — Kanpur Kitchen

Ek chhota static web app jisse kisi bhi school ki location aur detail
(driver, route executive, SPOC, address, contact numbers) ek tap me mil
jaaye, route-wise map ke saath.

Koi backend/server nahi chahiye — 3 files hain (`index.html`, `app.js`,
`data.js`), sab browser me hi chalte hain. GitHub Pages pe free host ho
jayega.

## Features
- Search: school name, UDISE code, node code, route code, SPOC name, area — sab se match
- Route filter chips: route select karo to map par us route ke saare
  schools ke beech connecting line (dispatch sequence) dikhti hai
- Har school card tap karne par: full detail drawer — address, category,
  UDISE, route/node code, driver/route-executive/SPOC contact
- One-tap "Directions" button — seedha Google Maps me route khul jayega
- One-tap "Call School" button (SPOC number) alag se, "Driver" call
  button se alag — school ka apna contact clearly nikal ke aata hai
- Contact numbers `tel:` link hain — mobile par tap karte hi call lagti hai
- Mobile par List/Map toggle; desktop par dono side-by-side
- First-load par ek beta-notice (usage tips + "bugs fix ho jaayenge"
  disclaimer) — ek baar band karo to dobara us device/browser par kabhi
  nahi dikhega

## Recent fixes (is update me)
- **Map tiles fix**: pehle CARTO ke free dark-map tiles use ho rahe the,
  jinhone ab API key mandatory kar di — isliye map load nahi ho raha tha.
  Ab OpenStreetMap ke standard (hamesha free, no-key) tiles use ho rahe
  hain, upar se ek CSS filter laga kar dark look diya gaya hai.
- **Drawer/profile khulne ka bug fix**: kabhi-kabhi school pe tap karne
  par sirf map dikhta tha, poori profile nahi khulti thi — Leaflet map
  ka z-index drawer se zyada tha isliye drawer neeche dab jaata tha. Ab
  drawer/overlay ka z-index map se upar rakha gaya hai, aur mobile par
  jo background me List→Map switch hota tha (jo confusion badhata tha)
  wo hata diya gaya hai.
- **Call School button**: SPOC number (jo asal me school ka number hai)
  ke liye dedicated call button add kiya, jo pehle sirf "Driver" call
  button tha usse alag.

## GitHub par deploy kaise karein (5 min)

1. GitHub par naya repository banao — e.g. `mdm-route-finder`
   (public rakhna Pages free tier ke liye)
2. Is folder ki chaaron files (`index.html`, `app.js`, `data.js`,
   `README.md`) upload kar do — GitHub web UI me "Add file → Upload
   files" se seedha drag-drop ho jayega, git command line ki zaroorat
   nahi. Agar repo pehle se hai to purani files ko replace/overwrite
   karna (same naam se upload karoge to GitHub khud commit kar dega).
3. Repo ke **Settings → Pages** me jao
4. "Source" me `Deploy from a branch` select karo, branch = `main`,
   folder = `/(root)`, phir Save
5. 1-2 minute me link milega:
   `https://<tumhara-username>.github.io/mdm-route-finder/`
6. Ye link phone par home screen pe add kar lo — app jaisa hi khulega

## Data update karna ho to

`data.js` file me `SCHOOLS` array hai — naya school add karna ho ya
detail update karni ho, JSON object me values badal do aur file dobara
GitHub par upload/commit kar do. Agar future me Excel se dobara
generate karna ho, wahi column order use karna:

```
NODE_GROUP, NODE GROUP NAME, SCHOOL_NAME, UDISE-CODE, ROUTE CODE,
NODE CODE, ROUTE NAME, latitude, longitude, Driver Name, Contact number,
Route Executive Name, Contact Number, Address, Pincode,
School SPOC name, School SPOC number, School Category
```

Route ka connecting-line order Excel sheet ke row-order se hi liya
jaata hai — agar dispatch sequence sahi chahiye to sheet me schools
usi order me rakhna jis order me route cover hoti hai.

## Notes
- 129 schools, 6 routes (BAIRI, Barra, Govind Nagar, Kidwai Nagar,
  Shastri Nagar, Vijay Nagar) — `OS1_detail.xlsx` se generate kiya gaya
- Map tiles OpenStreetMap se free hain, koi API key kabhi nahi chahiye
- Beta-notice dismissal `localStorage` me save hota hai — sirf usi
  device/browser ke liye yaad rehta hai; naya device/browser use karoge
  to notice ek baar phir dikhega
- **Privacy note**: repo public hai, isliye `data.js` (school addresses,
  driver/SPOC phone numbers) ka URL kisi ko pata chal jaaye to wo
  seedha access kar sakta hai. Agar ye data private rakhna zaroori hai,
  to Cloudflare Pages + Cloudflare Access (free tier, login-gated)
  jaisa setup better rahega — jab chaho bata dena, wo bhi kar denge.
