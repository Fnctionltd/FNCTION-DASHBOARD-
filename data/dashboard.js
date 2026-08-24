// FNCTION dashboard data.
// Edit the values below to update the dashboard - no other files need changing.
// `value: null` renders as a placeholder, so unknown figures stay visibly unfilled.

window.FNCTION_DATA = {
  "brand": "FNCTION",
  "tagline": "Business Dashboard",
  "updated": "2026-08-24",
  "currency": "£",
  "sections": [
    {
      "id": "distribution",
      "title": "Distribution",
      "type": "metrics",
      "items": [
        {
          "label": "Existing Partners",
          "value": 18
        },
        {
          "label": "Future Partners",
          "value": 7
        },
        {
          "label": "Partner Revenue",
          "value": null,
          "format": "currency"
        },
        {
          "label": "Need Follow-Up",
          "value": 4,
          "tone": "warn"
        }
      ]
    },
    {
      "id": "finance",
      "title": "Finance",
      "type": "metrics",
      "items": [
        {
          "label": "Spent This Month",
          "value": null,
          "format": "currency"
        },
        {
          "label": "Outstanding Invoices",
          "value": null,
          "format": "currency"
        },
        {
          "label": "Overdue",
          "value": null,
          "format": "currency",
          "tone": "alert"
        }
      ]
    },
    {
      "id": "manufacturing",
      "title": "Manufacturing",
      "type": "groups",
      "groups": [
        {
          "name": "MP Bioscience",
          "lines": [
            {
              "label": "CALM",
              "status": "Reformulation"
            },
            {
              "label": "CHARGE",
              "status": "Sampling"
            }
          ]
        },
        {
          "name": "Bakpac",
          "lines": [
            {
              "label": "Sachets",
              "status": "Production"
            },
            {
              "label": "Pouches",
              "status": "Awaiting Quote"
            }
          ]
        },
        {
          "name": "Tiny Box",
          "lines": [
            {
              "label": "15 Day",
              "status": "Ordered"
            },
            {
              "label": "30 Day",
              "status": "In Production"
            }
          ]
        },
        {
          "name": "China",
          "lines": [
            {
              "label": "Frothers",
              "status": "Shipping"
            },
            {
              "label": "Eye Masks",
              "status": "Sampling"
            }
          ]
        }
      ]
    },
    {
      "id": "marketing",
      "title": "Marketing",
      "type": "channels",
      "items": [
        {
          "label": "Instagram",
          "status": "Active"
        },
        {
          "label": "Meta Ads",
          "status": "Active"
        },
        {
          "label": "YouTube",
          "status": "Planning"
        },
        {
          "label": "TikTok",
          "status": "Active"
        },
        {
          "label": "Post Schedule",
          "status": "6 Scheduled"
        },
        {
          "label": "SMS",
          "status": "Drafting"
        },
        {
          "label": "Email",
          "status": "Drafting"
        }
      ]
    }
  ],
  "statusTones": {
    "Active": "live",
    "Production": "live",
    "In Production": "live",
    "Ordered": "live",
    "Shipping": "progress",
    "Sampling": "progress",
    "Reformulation": "progress",
    "Planning": "progress",
    "Drafting": "progress",
    "Awaiting Quote": "blocked",
    "Need Follow-Up": "blocked"
  }
};
