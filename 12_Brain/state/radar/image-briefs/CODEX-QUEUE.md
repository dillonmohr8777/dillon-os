# Codex image queue — generated 2026-08-15

100 rebuild targets own no usable photographs. Each has a brief in
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
| 11 | Golden Eagle Jewelry | jewelry | Philadelphia | golden-eagle-jewelry.json |
| 12 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 13 | ansarispharma.com | works |  | ansarispharma-com.json |
| 14 | Ward Insurance Associates Inc. | insurance | Levittown | ward-insurance-associates-inc.json |
| 15 | Fortitude & Co | fitness-centre | Philadelphia | fortitude-and-co.json |
| 16 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 17 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 18 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 19 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 20 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 21 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 22 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 23 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 24 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 25 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 26 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 27 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 28 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 29 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 30 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 31 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 32 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 33 | Danger Salon | hairdresser | Philadelphia | danger-salon.json |
| 34 | Sense Zero Float Center | beauty | Yardley | sense-zero-float-center.json |
| 35 | Mexico Magico | tax-advisor | Avondale | mexico-magico.json |
| 36 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 37 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 38 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 39 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 40 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 41 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 42 | Train and Nourish | fitness-centre | Philadelphia | train-and-nourish.json |
| 43 | Fusion Gyms | fitness-centre | Philadelphia | fusion-gyms.json |
| 44 | Easy Auto Tag & Insurance | insurance |  | easy-auto-tag-and-insurance.json |
| 45 | NewAge® Industries | works | Southampton | newage-industries.json |
| 46 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 47 | Francis Kaufman House | restaurant |  | francis-kaufman-house.json |
| 48 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 49 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 50 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 51 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 52 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 53 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 54 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 55 | Bar 31 | bar | Ambler | bar-31.json |
| 56 | August Moon | restaurant | Norristown | august-moon.json |
| 57 | Theory | clothes | Pottstown | theory.json |
| 58 | Highline Motors | car-repair | Aston | highline-motors.json |
| 59 | Hero Complex | books | Philadelphia | hero-complex.json |
| 60 | Barnes Financial Group | accountant | Media | barnes-financial-group.json |
| 61 | Weathers Motors & Auto Sales | car | Media | weathers-motors-and-auto-sales.json |
| 62 | TM Prestige Home Cash Buyer | estate-agent | Philadelphia | tm-prestige-home-cash-buyer.json |
| 63 | Kinetic Physical Therapy | physiotherapist | Collegeville | kinetic-physical-therapy.json |
| 64 | Field 1 Post, LLC | advertising-agency | Havertown | field-1-post-llc.json |
| 65 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | hvac | Havertown | boyle-energy-heating-air-conditioning-oil-and-propane.json |
| 66 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 67 | Euphoria Nail Bar | beauty |  | euphoria-nail-bar.json |
| 68 | Narberth Pizza | restaurant | Narberth | narberth-pizza.json |
| 69 | Al Tacos Locos | restaurant | Jenkintown | al-tacos-locos.json |
| 70 | Ming's Chinese | restaurant | Hatboro | ming-s-chinese.json |
| 71 | Ember & Ale | restaurant | Collegeville | ember-and-ale.json |
| 72 | The Edge Fitness Clubs | fitness-centre | Media | the-edge-fitness-clubs.json |
| 73 | Epam | it | Philadelphia | epam.json |
| 74 | Fit4Mom | fitness-centre | Warrington | fit4mom.json |
| 75 | Belle Palace Nail Spa | beauty | Warrington | belle-palace-nail-spa.json |
| 76 | Anthropology | clothes | Devon | anthropology.json |
| 77 | Better Homes and Gardens Real Estate Community Realty | estate-agent | Phoenixville | better-homes-and-gardens-real-estate-community-realty.json |
| 78 | Pier 6 | shipyard |  | pier-6.json |
| 79 | Colket Translational Research Building | clinic | Philadelphia | colket-translational-research-building.json |
| 80 | Sangillo Tire Center | tyres | Folsom | sangillo-tire-center.json |
| 81 | Mack’s Hair Studio | hairdresser | Philadelphia | mack-s-hair-studio.json |
| 82 | Balance Studios | fitness-centre | Philadelphia | balance-studios.json |
| 83 | S.B. Health | fitness-centre | Bristol Township | s-b-health.json |
| 84 | Custom IT Solutions | it | Lower Salford Township | custom-it-solutions.json |
| 85 | Captain Car Wash | car-wash | Norristown | captain-car-wash.json |
| 86 | Heart & Soul Tattoo | tattoo | East Greenville | heart-and-soul-tattoo.json |
| 87 | Manatawny Still Works | distillery |  | manatawny-still-works.json |
| 88 | Just Tires | car-repair |  | just-tires.json |
| 89 | Kevin T Coyne Attorney At Law | lawyer | Media | kevin-t-coyne-attorney-at-law.json |
| 90 | The Rouse Group Development Co. | estate-agent | Havertown | the-rouse-group-development-co.json |
| 91 | O'Donnell, Weiss & Mattei, P.C. | lawyer |  | o-donnell-weiss-and-mattei-p-c.json |
| 92 | Seiler & Drury | architect | Norristown | seiler-and-drury.json |
| 93 | LPL Financial | financial | Colmar | lpl-financial.json |
| 94 | The Restaurant Store | kitchen | Norristown | the-restaurant-store.json |
| 95 | NovaCare | clinic | Conshohocken | novacare.json |
| 96 | J-Pro, Inc. | swimming-pool | Bridgeport | j-pro-inc.json |
| 97 | Towne Book Center & Wine Bar | books | Collegeville | towne-book-center-and-wine-bar.json |
| 98 | Agnes Edmunds Bridal & Formals | clothes | Pottstown | agnes-edmunds-bridal-and-formals.json |
| 99 | Rally House Collegeville | sports | Collegeville | rally-house-collegeville.json |
| 100 | Rocco's Brick Oven Pizzeria | restaurant | Collegeville | rocco-s-brick-oven-pizzeria.json |
