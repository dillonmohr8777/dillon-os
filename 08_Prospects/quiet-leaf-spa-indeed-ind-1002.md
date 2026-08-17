---
prospect_id: "indeed:ind-1002"
business_name: "Quiet Leaf Spa"
source: indeed
website: https://quietleafspa.example
vertical: spa
status: scored
score: 33
last_touched: 2026-07-29
next_action: "Enrich website/harvest and rescore"
tags: [prospect, scored]
---

# Quiet Leaf Spa

Score: **33**/100 (scored)

## Reasons
- +3 ability: 5+ reviews
- +15 vertical fit: spa
- +5 has website URL
- +10 hiring signal present

## Source payload
```json
{
  "hiring_signal": {
    "role": "Front Desk Associate",
    "salary_band": null,
    "posted_at": null,
    "job_url": null,
    "source": "indeed"
  },
  "place_id": null,
  "review_count": 12,
  "rating": null,
  "market": "Erie, PA"
}
```

## Next
Below build threshold or missing website — enrich and rescore.
