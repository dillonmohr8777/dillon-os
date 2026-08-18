# Codex image queue — generated 2026-08-18

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
| 3 | Colonial Animal Hospital | veterinary | Newtown Square | colonial-animal-hospital.json |
| 4 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 5 | Lee's Hoagie House | restaurant |  | lee-s-hoagie-house.json |
| 6 | P & C Insurance Agency LLC | insurance | Aldan | p-and-c-insurance-agency-llc.json |
| 7 | Anthony Gueriera Jr. Insurance Agency LLC | insurance | Broomall | anthony-gueriera-jr-insurance-agency-llc.json |
| 8 | Big Head Transport, LLC | tyres | Philadelphia | big-head-transport-llc.json |
| 9 | Kehan's Auto Service | car-repair | Philadelphia | kehan-s-auto-service.json |
| 10 | Elite Auto Parts | car-parts | Philadelphia | elite-auto-parts.json |
| 11 | Bàn Bàn Asian Bistro | restaurant |  | b-n-b-n-asian-bistro.json |
| 12 | Golden Eagle Jewelry | jewelry | Philadelphia | golden-eagle-jewelry.json |
| 13 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 14 | ansarispharma.com | works |  | ansarispharma-com.json |
| 15 | Ward Insurance Associates Inc. | insurance | Levittown | ward-insurance-associates-inc.json |
| 16 | Fortitude & Co | fitness-centre | Philadelphia | fortitude-and-co.json |
| 17 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 18 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 19 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 20 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 21 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 22 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 23 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 24 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 25 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 26 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 27 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 28 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 29 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 30 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 31 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 32 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 33 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 34 | Danger Salon | hairdresser | Philadelphia | danger-salon.json |
| 35 | Sense Zero Float Center | beauty | Yardley | sense-zero-float-center.json |
| 36 | Mexico Magico | tax-advisor | Avondale | mexico-magico.json |
| 37 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 38 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 39 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 40 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 41 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 42 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 43 | Train and Nourish | fitness-centre | Philadelphia | train-and-nourish.json |
| 44 | Fusion Gyms | fitness-centre | Philadelphia | fusion-gyms.json |
| 45 | Easy Auto Tag & Insurance | insurance |  | easy-auto-tag-and-insurance.json |
| 46 | NewAge® Industries | works | Southampton | newage-industries.json |
| 47 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 48 | Francis Kaufman House | restaurant |  | francis-kaufman-house.json |
| 49 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 50 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 51 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 52 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 53 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 54 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 55 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 56 | Bar 31 | bar | Ambler | bar-31.json |
| 57 | August Moon | restaurant | Norristown | august-moon.json |
| 58 | Theory | clothes | Pottstown | theory.json |
| 59 | Highline Motors | car-repair | Aston | highline-motors.json |
| 60 | Hero Complex | books | Philadelphia | hero-complex.json |
| 61 | Barnes Financial Group | accountant | Media | barnes-financial-group.json |
| 62 | Weathers Motors & Auto Sales | car | Media | weathers-motors-and-auto-sales.json |
| 63 | TM Prestige Home Cash Buyer | estate-agent | Philadelphia | tm-prestige-home-cash-buyer.json |
| 64 | Kinetic Physical Therapy | physiotherapist | Collegeville | kinetic-physical-therapy.json |
| 65 | Field 1 Post, LLC | advertising-agency | Havertown | field-1-post-llc.json |
| 66 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | hvac | Havertown | boyle-energy-heating-air-conditioning-oil-and-propane.json |
| 67 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 68 | Euphoria Nail Bar | beauty |  | euphoria-nail-bar.json |
| 69 | Narberth Pizza | restaurant | Narberth | narberth-pizza.json |
| 70 | Al Tacos Locos | restaurant | Jenkintown | al-tacos-locos.json |
| 71 | Ming's Chinese | restaurant | Hatboro | ming-s-chinese.json |
| 72 | Ember & Ale | restaurant | Collegeville | ember-and-ale.json |
| 73 | The Edge Fitness Clubs | fitness-centre | Media | the-edge-fitness-clubs.json |
| 74 | Affordable Dentures & Implants | dentist | Doylestown | affordable-dentures-and-implants.json |
| 75 | B & M Construction & Hvac LLC | hvac | Whitehall | b-and-m-construction-and-hvac-llc.json |
| 76 | Epam | it | Philadelphia | epam.json |
| 77 | Fit4Mom | fitness-centre | Warrington | fit4mom.json |
| 78 | Belle Palace Nail Spa | beauty | Warrington | belle-palace-nail-spa.json |
| 79 | Anthropology | clothes | Devon | anthropology.json |
| 80 | Better Homes and Gardens Real Estate Community Realty | estate-agent | Phoenixville | better-homes-and-gardens-real-estate-community-realty.json |
| 81 | Pier 6 | shipyard |  | pier-6.json |
| 82 | Colket Translational Research Building | clinic | Philadelphia | colket-translational-research-building.json |
| 83 | Sangillo Tire Center | tyres | Folsom | sangillo-tire-center.json |
| 84 | Mack’s Hair Studio | hairdresser | Philadelphia | mack-s-hair-studio.json |
| 85 | Balance Studios | fitness-centre | Philadelphia | balance-studios.json |
| 86 | S.B. Health | fitness-centre | Bristol Township | s-b-health.json |
| 87 | Custom IT Solutions | it | Lower Salford Township | custom-it-solutions.json |
| 88 | Captain Car Wash | car-wash | Norristown | captain-car-wash.json |
| 89 | Heart & Soul Tattoo | tattoo | East Greenville | heart-and-soul-tattoo.json |
| 90 | Manatawny Still Works | distillery |  | manatawny-still-works.json |
| 91 | Just Tires | car-repair |  | just-tires.json |
| 92 | Kevin T Coyne Attorney At Law | lawyer | Media | kevin-t-coyne-attorney-at-law.json |
| 93 | The Rouse Group Development Co. | estate-agent | Havertown | the-rouse-group-development-co.json |
| 94 | Connolly Dermatology | doctor | Newtown Square | connolly-dermatology.json |
| 95 | O'Donnell, Weiss & Mattei, P.C. | lawyer |  | o-donnell-weiss-and-mattei-p-c.json |
| 96 | Seiler & Drury | architect | Norristown | seiler-and-drury.json |
| 97 | LPL Financial | financial | Colmar | lpl-financial.json |
| 98 | The Restaurant Store | kitchen | Norristown | the-restaurant-store.json |
| 99 | NovaCare | clinic | Conshohocken | novacare.json |
| 100 | J-Pro, Inc. | swimming-pool | Bridgeport | j-pro-inc.json |
