# FNCTION Dashboard

A single-screen operating view of the business: distribution, finance, manufacturing and marketing,
all visible without scrolling on a laptop.

It is a static page — no build step, no dependencies, no server required.

## Running it

Open `index.html` in a browser. That's it.

To serve it locally instead (useful for sharing on a LAN):

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Updating the numbers

Everything on screen comes from **`data/dashboard.js`**. Edit that one file and refresh — no other
file needs to change.

```js
{ "label": "Existing Partners", "value": 18 }
{ "label": "Partner Revenue", "value": 42500, "format": "currency" }
```

- `"value": null` renders the `£XX,XXX` placeholder, so a figure that hasn't been filled in never
  reads as a real one. Replace `null` with a plain number (no commas, no `£`) once you have it.
- `"format": "currency"` prefixes the symbol set in `"currency"` and adds thousands separators.
- `"tone": "warn"` (amber) or `"tone": "alert"` (red) highlights a metric that needs attention.
- `"updated"` is the date shown in the header — set it as `YYYY-MM-DD`.

### Statuses

Manufacturing lines and marketing channels each carry a `"status"` string, and the colour of its
dot comes from the `statusTones` map at the bottom of the data file:

| Tone | Colour | Meaning | Current statuses |
| --- | --- | --- | --- |
| `live` | green | on track / in flight | Active, Production, In Production, Ordered |
| `progress` | amber | moving, not finished | Shipping, Sampling, Reformulation, Planning, Drafting |
| `blocked` | red | waiting on someone | Awaiting Quote, Need Follow-Up |

A status with no entry in the map still renders — it just gets a neutral grey dot. Add it to
`statusTones` to give it a colour.

### Adding a supplier or channel

Append to the relevant array in `data/dashboard.js`:

```js
// a new manufacturing supplier
{ "name": "New Supplier", "lines": [ { "label": "Product", "status": "Sampling" } ] }

// a new marketing channel
{ "label": "Pinterest", "status": "Planning" }
```

The layout reflows on its own.

## Layout

| File | Purpose |
| --- | --- |
| `index.html` | Page shell — masthead, empty `<main>`, legend |
| `data/dashboard.js` | All content and figures |
| `assets/dashboard.js` | Renders the data into the page; theme toggle |
| `assets/styles.css` | Styling, dark and light palettes, print rules |

Dark by default, follows the OS preference on first visit, and the toggle in the header is
remembered per browser. The page prints cleanly to one sheet.
