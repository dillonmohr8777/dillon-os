# Codex image queue — generated 2026-08-25

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
| 5 | B & M Construction & Hvac LLC | hvac | Whitehall | b-and-m-construction-and-hvac-llc.json |
| 6 | Lee's Hoagie House | restaurant |  | lee-s-hoagie-house.json |
| 7 | Broker Resource Center | insurance | King of Prussia | broker-resource-center.json |
| 8 | P & C Insurance Agency LLC | insurance | Aldan | p-and-c-insurance-agency-llc.json |
| 9 | Anthony Gueriera Jr. Insurance Agency LLC | insurance | Broomall | anthony-gueriera-jr-insurance-agency-llc.json |
| 10 | Ashley Hunter's Tags & Insurance | insurance | Folsom | ashley-hunter-s-tags-and-insurance.json |
| 11 | Bàn Bàn Asian Bistro | restaurant |  | b-n-b-n-asian-bistro.json |
| 12 | Rice House | restaurant | Collegeville | rice-house.json |
| 13 | Ward Insurance Associates Inc. | insurance | Levittown | ward-insurance-associates-inc.json |
| 14 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 15 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 16 | ansarispharma.com | works |  | ansarispharma-com.json |
| 17 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 18 | Andorra Pediatrics | doctor | Philadelphia | andorra-pediatrics.json |
| 19 | Acorn Landscaping | gardener | Norristown | acorn-landscaping.json |
| 20 | James W. Zerillo Law Offices | lawyer | Pottstown | james-w-zerillo-law-offices.json |
| 21 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 22 | Norristown Glass | glaziery | Norristown | norristown-glass.json |
| 23 | Eagle Kitchens & Design Studio, LLC | kitchen | Spring House | eagle-kitchens-and-design-studio-llc.json |
| 24 | Caballero's Inc. | painter | Willow Grove | caballero-s-inc.json |
| 25 | Gehman Chiropractic Office | alternative | Hatfield | gehman-chiropractic-office.json |
| 26 | Charles Cohen Plumbing and Heating | plumber | Jenkintown | charles-cohen-plumbing-and-heating.json |
| 27 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 28 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 29 | A Plus Family Drain Cleaning | plumber | Upper Darby | a-plus-family-drain-cleaning.json |
| 30 | A & J Custom Painting | painter | Bensalem | a-and-j-custom-painting.json |
| 31 | Chris Orser Landscaping | gardener | Doylestown | chris-orser-landscaping.json |
| 32 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 33 | Sharp Stream Power Washing & Painting | painter | West Chester | sharp-stream-power-washing-and-painting.json |
| 34 | Big Head Transport, LLC | tyres | Philadelphia | big-head-transport-llc.json |
| 35 | Kehan's Auto Service | car-repair | Philadelphia | kehan-s-auto-service.json |
| 36 | Judy's Hair and Wig Salon | beauty | Philadelphia | judy-s-hair-and-wig-salon.json |
| 37 | Elite Auto Parts | car-parts | Philadelphia | elite-auto-parts.json |
| 38 | MYTECH Automotive Service Center | car-repair | Limerick | mytech-automotive-service-center.json |
| 39 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 40 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 41 | Lans Nails | beauty | Lansdale | lans-nails.json |
| 42 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 43 | Valley Auto Group, Inc. | car-repair | Pennsburg | valley-auto-group-inc.json |
| 44 | Powerstroke Diesel Specialties | car-repair | Pottstown | powerstroke-diesel-specialties.json |
| 45 | Metro Motors | car | Upper Darby | metro-motors.json |
| 46 | Fenza's Auto Body | car-repair | Chester | fenza-s-auto-body.json |
| 47 | Wallace Auto Service | car-repair | Bryn Mawr | wallace-auto-service.json |
| 48 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 49 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 50 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 51 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 52 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 53 | Golden Eagle Jewelry | jewelry | Philadelphia | golden-eagle-jewelry.json |
| 54 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 55 | Sense Zero Float Center | beauty | Yardley | sense-zero-float-center.json |
| 56 | Mexico Magico | tax-advisor | Avondale | mexico-magico.json |
| 57 | Attitude Alley Motorcycle Co LLC | motorcycle | Lititz | attitude-alley-motorcycle-co-llc.json |
| 58 | Law Offices of D. A. Casselle | lawyer | Allentown | law-offices-of-d-a-casselle.json |
| 59 | 4/4 Architecture | architect | Bethlehem | 4-4-architecture.json |
| 60 | Randy's Greenhouse LLC | gardener | Athens | randy-s-greenhouse-llc.json |
| 61 | Fortitude & Co | fitness-centre | Philadelphia | fortitude-and-co.json |
| 62 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 63 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 64 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 65 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 66 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 67 | NewAge® Industries | works | Southampton | newage-industries.json |
| 68 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 69 | Bimbo Bakeries USA | bakery | Bethlehem | bimbo-bakeries-usa.json |
| 70 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 71 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 72 | Clear Vision Auto Glass | car-repair | Chadds Ford | clear-vision-auto-glass.json |
| 73 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 74 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 75 | Danger Salon | hairdresser | Philadelphia | danger-salon.json |
| 76 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 77 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 78 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 79 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 80 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 81 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 82 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 83 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 84 | Bar 31 | bar | Ambler | bar-31.json |
| 85 | August Moon | restaurant | Norristown | august-moon.json |
| 86 | Theory | clothes | Pottstown | theory.json |
| 87 | Highline Motors | car-repair | Aston | highline-motors.json |
| 88 | Fit4Mom | fitness-centre | Warrington | fit4mom.json |
| 89 | Belle Palace Nail Spa | beauty | Warrington | belle-palace-nail-spa.json |
| 90 | Anthropology | clothes | Devon | anthropology.json |
| 91 | Barnes Financial Group | accountant | Media | barnes-financial-group.json |
| 92 | Weathers Motors & Auto Sales | car | Media | weathers-motors-and-auto-sales.json |
| 93 | Train and Nourish | fitness-centre | Philadelphia | train-and-nourish.json |
| 94 | Fusion Gyms | fitness-centre | Philadelphia | fusion-gyms.json |
| 95 | Better Homes and Gardens Real Estate Community Realty | estate-agent | Phoenixville | better-homes-and-gardens-real-estate-community-realty.json |
| 96 | About All Floors | floorer | Wyomissing | about-all-floors.json |
| 97 | Easy Auto Tag & Insurance | insurance |  | easy-auto-tag-and-insurance.json |
| 98 | Kinetic Physical Therapy | physiotherapist | Collegeville | kinetic-physical-therapy.json |
| 99 | Field 1 Post, LLC | advertising-agency | Havertown | field-1-post-llc.json |
| 100 | Boyle Energy - Heating, Air Conditioning, Oil & Propane | hvac | Havertown | boyle-energy-heating-air-conditioning-oil-and-propane.json |
