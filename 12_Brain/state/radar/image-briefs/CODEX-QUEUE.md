# Codex image queue — generated 2026-08-07

56 rebuild targets own no usable photographs. Each has a brief in
this directory specifying exactly what to generate, slot by slot.

## The contract

1. Read `<slug>.json`. Generate each slot's image from its `prompt` at its
   `dimensions`. Six photos per prospect; a logo ONLY if the brief says so.
2. Write outputs to the brief's `output_dir` (under `12_Brain/private/`,
   which is gitignored — the binaries never enter this public repo).
3. Every image: photorealistic, natural light, **no text or lettering
   anywhere**, **no faces**, one consistent light temperature per prospect.
4. Build with `buildArchSite(prospect, { generatedAssets: true, ... })` or
   pass `--generated-assets` to the deploy runner. That flag injects the
   disclosure line; a page from generated imagery without it must not ship.
5. The rule stands: these images are illustrative concepts. They are never
   presented as the business's own photographs, in the page or in the pitch.

## Queue (priority order)

| # | Business | Vertical | City | Brief |
|---|---|---|---|---|
| 1 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 2 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 3 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 4 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 5 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 6 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 7 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 8 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 9 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 10 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 11 | Easy Auto Tag & Insurance | insurance |  | easy-auto-tag-and-insurance.json |
| 12 | NewAge® Industries | works | Southampton | newage-industries.json |
| 13 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 14 | Francis Kaufman House | restaurant |  | francis-kaufman-house.json |
| 15 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 16 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 17 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 18 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 19 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 20 | Bar 31 | bar | Ambler | bar-31.json |
| 21 | August Moon | restaurant | Norristown | august-moon.json |
| 22 | Theory | clothes | Pottstown | theory.json |
| 23 | Highline Motors | car-repair | Aston | highline-motors.json |
| 24 | TM Prestige Home Cash Buyer | estate-agent | Philadelphia | tm-prestige-home-cash-buyer.json |
| 25 | Kinetic Physical Therapy | physiotherapist | Collegeville | kinetic-physical-therapy.json |
| 26 | Field 1 Post, LLC | advertising-agency | Havertown | field-1-post-llc.json |
| 27 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | hvac | Havertown | boyle-energy-heating-air-conditioning-oil-and-propane.json |
| 28 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 29 | Euphoria Nail Bar | beauty |  | euphoria-nail-bar.json |
| 30 | Narberth Pizza | restaurant | Narberth | narberth-pizza.json |
| 31 | Al Tacos Locos | restaurant | Jenkintown | al-tacos-locos.json |
| 32 | Ming's Chinese | restaurant | Hatboro | ming-s-chinese.json |
| 33 | Ember & Ale | restaurant | Collegeville | ember-and-ale.json |
| 34 | Epam | it | Philadelphia | epam.json |
| 35 | Pier 6 | shipyard |  | pier-6.json |
| 36 | Custom IT Solutions | it | Lower Salford Township | custom-it-solutions.json |
| 37 | Captain Car Wash | car-wash | Norristown | captain-car-wash.json |
| 38 | Heart & Soul Tattoo | tattoo | East Greenville | heart-and-soul-tattoo.json |
| 39 | Manatawny Still Works | distillery |  | manatawny-still-works.json |
| 40 | Just Tires | car-repair |  | just-tires.json |
| 41 | O'Donnell, Weiss & Mattei, P.C. | lawyer |  | o-donnell-weiss-and-mattei-p-c.json |
| 42 | Seiler & Drury | architect | Norristown | seiler-and-drury.json |
| 43 | LPL Financial | financial | Colmar | lpl-financial.json |
| 44 | The Restaurant Store | kitchen | Norristown | the-restaurant-store.json |
| 45 | NovaCare | clinic | Conshohocken | novacare.json |
| 46 | J-Pro, Inc. | swimming-pool | Bridgeport | j-pro-inc.json |
| 47 | Towne Book Center & Wine Bar | books | Collegeville | towne-book-center-and-wine-bar.json |
| 48 | Agnes Edmunds Bridal & Formals | clothes | Pottstown | agnes-edmunds-bridal-and-formals.json |
| 49 | Rally House Collegeville | sports | Collegeville | rally-house-collegeville.json |
| 50 | Rocco's Brick Oven Pizzeria | restaurant | Collegeville | rocco-s-brick-oven-pizzeria.json |
| 51 | Red Hill Greenhouses & Florist | florist | Red Hill | red-hill-greenhouses-and-florist.json |
| 52 | Ferrari Philadelphia | car | Newtown Square | ferrari-philadelphia.json |
| 53 | Trend Auto Trader | car-repair | Quakertown | trend-auto-trader.json |
| 54 | APR Supply Company | trade | Malvern | apr-supply-company.json |
| 55 | City Electric Supply | energy-supplier | West Chester | city-electric-supply.json |
| 56 | Borsello Landscaping | gardener | Avondale | borsello-landscaping.json |
