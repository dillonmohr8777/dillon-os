# Codex image queue — generated 2026-08-09

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
| 15 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 16 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 17 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 18 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 19 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 20 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 21 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 22 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 23 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 24 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 25 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 26 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 27 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 28 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 29 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 30 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 31 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 32 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 33 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 34 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 35 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 36 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 37 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 38 | Easy Auto Tag & Insurance | insurance |  | easy-auto-tag-and-insurance.json |
| 39 | NewAge® Industries | works | Southampton | newage-industries.json |
| 40 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 41 | Francis Kaufman House | restaurant |  | francis-kaufman-house.json |
| 42 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 43 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 44 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 45 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 46 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 47 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 48 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 49 | Bar 31 | bar | Ambler | bar-31.json |
| 50 | August Moon | restaurant | Norristown | august-moon.json |
| 51 | Theory | clothes | Pottstown | theory.json |
| 52 | Highline Motors | car-repair | Aston | highline-motors.json |
| 53 | Hero Complex | books | Philadelphia | hero-complex.json |
| 54 | Barnes Financial Group | accountant | Media | barnes-financial-group.json |
| 55 | TM Prestige Home Cash Buyer | estate-agent | Philadelphia | tm-prestige-home-cash-buyer.json |
| 56 | Kinetic Physical Therapy | physiotherapist | Collegeville | kinetic-physical-therapy.json |
| 57 | Field 1 Post, LLC | advertising-agency | Havertown | field-1-post-llc.json |
| 58 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | hvac | Havertown | boyle-energy-heating-air-conditioning-oil-and-propane.json |
| 59 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 60 | Euphoria Nail Bar | beauty |  | euphoria-nail-bar.json |
| 61 | Narberth Pizza | restaurant | Narberth | narberth-pizza.json |
| 62 | Al Tacos Locos | restaurant | Jenkintown | al-tacos-locos.json |
| 63 | Ming's Chinese | restaurant | Hatboro | ming-s-chinese.json |
| 64 | Ember & Ale | restaurant | Collegeville | ember-and-ale.json |
| 65 | The Edge Fitness Clubs | fitness-centre | Media | the-edge-fitness-clubs.json |
| 66 | Epam | it | Philadelphia | epam.json |
| 67 | Fit4Mom | fitness-centre | Warrington | fit4mom.json |
| 68 | Belle Palace Nail Spa | beauty | Warrington | belle-palace-nail-spa.json |
| 69 | Anthropology | clothes | Devon | anthropology.json |
| 70 | Pier 6 | shipyard |  | pier-6.json |
| 71 | Colket Translational Research Building | clinic | Philadelphia | colket-translational-research-building.json |
| 72 | Custom IT Solutions | it | Lower Salford Township | custom-it-solutions.json |
| 73 | Captain Car Wash | car-wash | Norristown | captain-car-wash.json |
| 74 | Heart & Soul Tattoo | tattoo | East Greenville | heart-and-soul-tattoo.json |
| 75 | Manatawny Still Works | distillery |  | manatawny-still-works.json |
| 76 | Just Tires | car-repair |  | just-tires.json |
| 77 | Kevin T Coyne Attorney At Law | lawyer | Media | kevin-t-coyne-attorney-at-law.json |
| 78 | The Rouse Group Development Co. | estate-agent | Havertown | the-rouse-group-development-co.json |
| 79 | O'Donnell, Weiss & Mattei, P.C. | lawyer |  | o-donnell-weiss-and-mattei-p-c.json |
| 80 | Seiler & Drury | architect | Norristown | seiler-and-drury.json |
| 81 | LPL Financial | financial | Colmar | lpl-financial.json |
| 82 | The Restaurant Store | kitchen | Norristown | the-restaurant-store.json |
| 83 | NovaCare | clinic | Conshohocken | novacare.json |
| 84 | J-Pro, Inc. | swimming-pool | Bridgeport | j-pro-inc.json |
| 85 | Towne Book Center & Wine Bar | books | Collegeville | towne-book-center-and-wine-bar.json |
| 86 | Agnes Edmunds Bridal & Formals | clothes | Pottstown | agnes-edmunds-bridal-and-formals.json |
| 87 | Rally House Collegeville | sports | Collegeville | rally-house-collegeville.json |
| 88 | Rocco's Brick Oven Pizzeria | restaurant | Collegeville | rocco-s-brick-oven-pizzeria.json |
| 89 | Red Hill Greenhouses & Florist | florist | Red Hill | red-hill-greenhouses-and-florist.json |
| 90 | Ferrari Philadelphia | car | Newtown Square | ferrari-philadelphia.json |
| 91 | Trend Auto Trader | car-repair | Quakertown | trend-auto-trader.json |
| 92 | Halligan & Keaton Law P.C. | lawyer | Media | halligan-and-keaton-law-p-c.json |
| 93 | Caise Benefits | insurance | Aston | caise-benefits.json |
| 94 | Riley Rodzianko & Clymer LLP | accountant | Quakertown | riley-rodzianko-and-clymer-llp.json |
| 95 | APR Supply Company | trade | Malvern | apr-supply-company.json |
| 96 | City Electric Supply | energy-supplier | West Chester | city-electric-supply.json |
| 97 | Borsello Landscaping | gardener | Avondale | borsello-landscaping.json |
| 98 | IVC Wealth Advisors | financial-advisor | Silverdale | ivc-wealth-advisors.json |
| 99 | Money Management Advisory, Inc. | financial | Feasterville | money-management-advisory-inc.json |
| 100 | Holiday Hair | hairdresser | Quakertown | holiday-hair.json |
