# Codex image queue — generated 2026-08-07

82 rebuild targets own no usable photographs. Each has a brief in
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
| 1 | Germantown Dental Group | dentist | Philadelphia | germantown-dental-group.json |
| 2 | Udis & Conn Orthodontics | dentist | Jenkintown | udis-and-conn-orthodontics.json |
| 3 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 4 | Lee's Hoagie House | restaurant |  | lee-s-hoagie-house.json |
| 5 | P & C Insurance Agency LLC | insurance | Aldan | p-and-c-insurance-agency-llc.json |
| 6 | Anthony Gueriera Jr. Insurance Agency LLC | insurance | Broomall | anthony-gueriera-jr-insurance-agency-llc.json |
| 7 | Big Head Transport, LLC | tyres | Philadelphia | big-head-transport-llc.json |
| 8 | Kehan's Auto Service | car-repair | Philadelphia | kehan-s-auto-service.json |
| 9 | Elite Auto Parts | car-parts | Philadelphia | elite-auto-parts.json |
| 10 | Bàn Bàn Asian Bistro | restaurant |  | b-n-b-n-asian-bistro.json |
| 11 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 12 | ansarispharma.com | works |  | ansarispharma-com.json |
| 13 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 14 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 15 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 16 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 17 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 18 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 19 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 20 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 21 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 22 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 23 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 24 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 25 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 26 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 27 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 28 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 29 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 30 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 31 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 32 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 33 | Easy Auto Tag & Insurance | insurance |  | easy-auto-tag-and-insurance.json |
| 34 | NewAge® Industries | works | Southampton | newage-industries.json |
| 35 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 36 | Francis Kaufman House | restaurant |  | francis-kaufman-house.json |
| 37 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 38 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 39 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 40 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 41 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 42 | Bar 31 | bar | Ambler | bar-31.json |
| 43 | August Moon | restaurant | Norristown | august-moon.json |
| 44 | Theory | clothes | Pottstown | theory.json |
| 45 | Highline Motors | car-repair | Aston | highline-motors.json |
| 46 | TM Prestige Home Cash Buyer | estate-agent | Philadelphia | tm-prestige-home-cash-buyer.json |
| 47 | Kinetic Physical Therapy | physiotherapist | Collegeville | kinetic-physical-therapy.json |
| 48 | Field 1 Post, LLC | advertising-agency | Havertown | field-1-post-llc.json |
| 49 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | hvac | Havertown | boyle-energy-heating-air-conditioning-oil-and-propane.json |
| 50 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 51 | Euphoria Nail Bar | beauty |  | euphoria-nail-bar.json |
| 52 | Narberth Pizza | restaurant | Narberth | narberth-pizza.json |
| 53 | Al Tacos Locos | restaurant | Jenkintown | al-tacos-locos.json |
| 54 | Ming's Chinese | restaurant | Hatboro | ming-s-chinese.json |
| 55 | Ember & Ale | restaurant | Collegeville | ember-and-ale.json |
| 56 | The Edge Fitness Clubs | fitness-centre | Media | the-edge-fitness-clubs.json |
| 57 | Epam | it | Philadelphia | epam.json |
| 58 | Fit4Mom | fitness-centre | Warrington | fit4mom.json |
| 59 | Belle Palace Nail Spa | beauty | Warrington | belle-palace-nail-spa.json |
| 60 | Pier 6 | shipyard |  | pier-6.json |
| 61 | Custom IT Solutions | it | Lower Salford Township | custom-it-solutions.json |
| 62 | Captain Car Wash | car-wash | Norristown | captain-car-wash.json |
| 63 | Heart & Soul Tattoo | tattoo | East Greenville | heart-and-soul-tattoo.json |
| 64 | Manatawny Still Works | distillery |  | manatawny-still-works.json |
| 65 | Just Tires | car-repair |  | just-tires.json |
| 66 | O'Donnell, Weiss & Mattei, P.C. | lawyer |  | o-donnell-weiss-and-mattei-p-c.json |
| 67 | Seiler & Drury | architect | Norristown | seiler-and-drury.json |
| 68 | LPL Financial | financial | Colmar | lpl-financial.json |
| 69 | The Restaurant Store | kitchen | Norristown | the-restaurant-store.json |
| 70 | NovaCare | clinic | Conshohocken | novacare.json |
| 71 | J-Pro, Inc. | swimming-pool | Bridgeport | j-pro-inc.json |
| 72 | Towne Book Center & Wine Bar | books | Collegeville | towne-book-center-and-wine-bar.json |
| 73 | Agnes Edmunds Bridal & Formals | clothes | Pottstown | agnes-edmunds-bridal-and-formals.json |
| 74 | Rally House Collegeville | sports | Collegeville | rally-house-collegeville.json |
| 75 | Rocco's Brick Oven Pizzeria | restaurant | Collegeville | rocco-s-brick-oven-pizzeria.json |
| 76 | Red Hill Greenhouses & Florist | florist | Red Hill | red-hill-greenhouses-and-florist.json |
| 77 | Ferrari Philadelphia | car | Newtown Square | ferrari-philadelphia.json |
| 78 | Trend Auto Trader | car-repair | Quakertown | trend-auto-trader.json |
| 79 | APR Supply Company | trade | Malvern | apr-supply-company.json |
| 80 | City Electric Supply | energy-supplier | West Chester | city-electric-supply.json |
| 81 | Borsello Landscaping | gardener | Avondale | borsello-landscaping.json |
| 82 | Holiday Hair | hairdresser | Quakertown | holiday-hair.json |
