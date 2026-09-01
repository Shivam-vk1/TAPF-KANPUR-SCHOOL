# MDM Route Finder — Kanpur Kitchen

A lightweight, browser-based web application for quickly finding **school locations, route information, and operational contact details** from a single interface.

Built as a static application with **HTML, CSS, and JavaScript**, the project requires no backend server and can be deployed easily using GitHub Pages.

---

## ✨ Features

- 🔎 **Smart Search** — Search by school name, UDISE code, node code, route code, SPOC name, or area.
- 🛣️ **Route Filtering** — Filter schools by route and visualize the selected route on the map.
- 🗺️ **Interactive Map** — View school locations using Leaflet and OpenStreetMap.
- 📋 **School Details** — View address, category, UDISE code, route code, node code, and other available information.
- 📞 **Quick Calling** — Direct call options for the school SPOC and driver on supported mobile devices.
- 📍 **Google Maps Directions** — Open directions to any school with one click.
- 📱 **Responsive Design** — Works on desktop and mobile devices with List/Map views.
- ⚡ **No Backend Required** — All application logic runs directly in the browser.

---

## 🧩 Project Structure

```text
mdm-route-finder/
├── index.html    # Application UI and styling
├── app.js        # Application logic, search, filters and map interactions
├── data.js       # School, route and contact data
└── README.md     # Project documentation
```

---

## 🚀 Getting Started

### Run Locally

No build tools or installation are required.

1. Download or clone the repository.
2. Keep all project files in the same folder.
3. Open `index.html` in a modern web browser.

The application will run directly in the browser.

### Deploy on GitHub Pages

1. Create a GitHub repository.
2. Upload `index.html`, `app.js`, `data.js`, and `README.md`.
3. Open **Settings → Pages**.
4. Select **Deploy from a branch**.
5. Select the `main` branch and `/ (root)` folder.
6. Save the settings.

GitHub will publish the application at:

```text
https://<username>.github.io/<repository-name>/
```

---

## 🗂️ Updating School Data

School information is stored in the `SCHOOLS` array inside `data.js`.

To add or update a school, edit the corresponding data object and commit the updated `data.js` file.

The data structure includes fields such as:

```text
Node Group
Node Group Name
School Name
UDISE Code
Route Code
Node Code
Route Name
Latitude
Longitude
Driver Name
Driver Contact
Route Executive
Route Executive Contact
Address
Pincode
School SPOC
School SPOC Contact
School Category
```

### Route Sequence

The route line follows the order of schools in the `SCHOOLS` data.

If the map should represent a specific operational or dispatch sequence, keep the schools in the required sequence in `data.js`.

---

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| HTML5 | Application structure |
| CSS3 | Responsive interface and styling |
| JavaScript | Application logic and interactions |
| Leaflet.js | Interactive maps |
| OpenStreetMap | Map tiles |
| Google Maps | Navigation and directions |

---

## 🔐 Data & Privacy

**Important:** If this repository is public, the contents of `data.js` are also publicly accessible.

If the dataset contains non-public phone numbers, addresses, or other sensitive operational information, **do not publish that data in a public repository**.

For private operational use, move the data to a protected backend or use an access-controlled hosting setup.

---

## 📌 Current Dataset

The current application contains school and route information for the Kanpur Kitchen operation, including multiple operational routes and associated school/contact details.

---

## 📄 License

This project is intended for operational/internal use. Add an appropriate open-source license only if the project is intended to be publicly reused or distributed.
