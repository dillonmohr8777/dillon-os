# Codex image queue — generated 2026-08-21

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
| 1 | Pearl Dental | dentist | Philadelphia | pearl-dental.json |
| 2 | Germantown Dental Group | dentist | Philadelphia | germantown-dental-group.json |
| 3 | Udis & Conn Orthodontics | dentist | Jenkintown | udis-and-conn-orthodontics.json |
| 4 | Colonial Animal Hospital | veterinary | Newtown Square | colonial-animal-hospital.json |
| 5 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 6 | Lee's Hoagie House | restaurant |  | lee-s-hoagie-house.json |
| 7 | Andorra Pediatrics | doctor | Philadelphia | andorra-pediatrics.json |
| 8 | Broker Resource Center | insurance | King of Prussia | broker-resource-center.json |
| 9 | P & C Insurance Agency LLC | insurance | Aldan | p-and-c-insurance-agency-llc.json |
| 10 | Anthony Gueriera Jr. Insurance Agency LLC | insurance | Broomall | anthony-gueriera-jr-insurance-agency-llc.json |
| 11 | Ashley Hunter's Tags & Insurance | insurance | Folsom | ashley-hunter-s-tags-and-insurance.json |
| 12 | Big Head Transport, LLC | tyres | Philadelphia | big-head-transport-llc.json |
| 13 | Kehan's Auto Service | car-repair | Philadelphia | kehan-s-auto-service.json |
| 14 | Judy's Hair and Wig Salon | beauty | Philadelphia | judy-s-hair-and-wig-salon.json |
| 15 | Elite Auto Parts | car-parts | Philadelphia | elite-auto-parts.json |
| 16 | Bàn Bàn Asian Bistro | restaurant |  | b-n-b-n-asian-bistro.json |
| 17 | Rice House | restaurant | Collegeville | rice-house.json |
| 18 | Golden Eagle Jewelry | jewelry | Philadelphia | golden-eagle-jewelry.json |
| 19 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 20 | ansarispharma.com | works |  | ansarispharma-com.json |
| 21 | Ward Insurance Associates Inc. | insurance | Levittown | ward-insurance-associates-inc.json |
| 22 | Fortitude & Co | fitness-centre | Philadelphia | fortitude-and-co.json |
| 23 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 24 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 25 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 26 | Acorn Landscaping | gardener | Norristown | acorn-landscaping.json |
| 27 | James W. Zerillo Law Offices | lawyer | Pottstown | james-w-zerillo-law-offices.json |
| 28 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 29 | Norristown Glass | glaziery | Norristown | norristown-glass.json |
| 30 | Eagle Kitchens & Design Studio, LLC | kitchen | Spring House | eagle-kitchens-and-design-studio-llc.json |
| 31 | Caballero's Inc. | painter | Willow Grove | caballero-s-inc.json |
| 32 | Gehman Chiropractic Office | alternative | Hatfield | gehman-chiropractic-office.json |
| 33 | Charles Cohen Plumbing and Heating | plumber | Jenkintown | charles-cohen-plumbing-and-heating.json |
| 34 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 35 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 36 | A Plus Family Drain Cleaning | plumber | Upper Darby | a-plus-family-drain-cleaning.json |
| 37 | MYTECH Automotive Service Center | car-repair | Limerick | mytech-automotive-service-center.json |
| 38 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 39 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 40 | Lans Nails | beauty | Lansdale | lans-nails.json |
| 41 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 42 | Valley Auto Group, Inc. | car-repair | Pennsburg | valley-auto-group-inc.json |
| 43 | Powerstroke Diesel Specialties | car-repair | Pottstown | powerstroke-diesel-specialties.json |
| 44 | Metro Motors | car | Upper Darby | metro-motors.json |
| 45 | Fenza's Auto Body | car-repair | Chester | fenza-s-auto-body.json |
| 46 | Wallace Auto Service | car-repair | Bryn Mawr | wallace-auto-service.json |
| 47 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 48 | A & J Custom Painting | painter | Bensalem | a-and-j-custom-painting.json |
| 49 | Chris Orser Landscaping | gardener | Doylestown | chris-orser-landscaping.json |
| 50 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 51 | Sharp Stream Power Washing & Painting | painter | West Chester | sharp-stream-power-washing-and-painting.json |
| 52 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 53 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 54 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 55 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 56 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 57 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 58 | Danger Salon | hairdresser | Philadelphia | danger-salon.json |
| 59 | Sense Zero Float Center | beauty | Yardley | sense-zero-float-center.json |
| 60 | Mexico Magico | tax-advisor | Avondale | mexico-magico.json |
| 61 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 62 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 63 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 64 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 65 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 66 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 67 | Train and Nourish | fitness-centre | Philadelphia | train-and-nourish.json |
| 68 | Fusion Gyms | fitness-centre | Philadelphia | fusion-gyms.json |
| 69 | Easy Auto Tag & Insurance | insurance |  | easy-auto-tag-and-insurance.json |
| 70 | NewAge® Industries | works | Southampton | newage-industries.json |
| 71 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 72 | Francis Kaufman House | restaurant |  | francis-kaufman-house.json |
| 73 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 74 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 75 | Clear Vision Auto Glass | car-repair | Chadds Ford | clear-vision-auto-glass.json |
| 76 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 77 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 78 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 79 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 80 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 81 | Bar 31 | bar | Ambler | bar-31.json |
| 82 | August Moon | restaurant | Norristown | august-moon.json |
| 83 | Theory | clothes | Pottstown | theory.json |
| 84 | Highline Motors | car-repair | Aston | highline-motors.json |
| 85 | Hero Complex | books | Philadelphia | hero-complex.json |
| 86 | Barnes Financial Group | accountant | Media | barnes-financial-group.json |
| 87 | Weathers Motors & Auto Sales | car | Media | weathers-motors-and-auto-sales.json |
| 88 | TM Prestige Home Cash Buyer | estate-agent | Philadelphia | tm-prestige-home-cash-buyer.json |
| 89 | Kinetic Physical Therapy | physiotherapist | Collegeville | kinetic-physical-therapy.json |
| 90 | Field 1 Post, LLC | advertising-agency | Havertown | field-1-post-llc.json |
| 91 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | hvac | Havertown | boyle-energy-heating-air-conditioning-oil-and-propane.json |
| 92 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 93 | Euphoria Nail Bar | beauty |  | euphoria-nail-bar.json |
| 94 | Narberth Pizza | restaurant | Narberth | narberth-pizza.json |
| 95 | Al Tacos Locos | restaurant | Jenkintown | al-tacos-locos.json |
| 96 | Ming's Chinese | restaurant | Hatboro | ming-s-chinese.json |
| 97 | Ember & Ale | restaurant | Collegeville | ember-and-ale.json |
| 98 | The Edge Fitness Clubs | fitness-centre | Media | the-edge-fitness-clubs.json |
| 99 | Affordable Dentures & Implants | dentist | Doylestown | affordable-dentures-and-implants.json |
| 100 | B & M Construction & Hvac LLC | hvac | Whitehall | b-and-m-construction-and-hvac-llc.json |
