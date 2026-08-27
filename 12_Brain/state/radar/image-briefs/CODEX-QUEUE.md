# Codex image queue — generated 2026-08-27

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
| 6 | Bradco Heating and Cooling | hvac | Cochranton | bradco-heating-and-cooling.json |
| 7 | Lee's Hoagie House | restaurant |  | lee-s-hoagie-house.json |
| 8 | Broker Resource Center | insurance | King of Prussia | broker-resource-center.json |
| 9 | P & C Insurance Agency LLC | insurance | Aldan | p-and-c-insurance-agency-llc.json |
| 10 | Anthony Gueriera Jr. Insurance Agency LLC | insurance | Broomall | anthony-gueriera-jr-insurance-agency-llc.json |
| 11 | Ashley Hunter's Tags & Insurance | insurance | Folsom | ashley-hunter-s-tags-and-insurance.json |
| 12 | Bàn Bàn Asian Bistro | restaurant |  | b-n-b-n-asian-bistro.json |
| 13 | Rice House | restaurant | Collegeville | rice-house.json |
| 14 | Ward Insurance Associates Inc. | insurance | Levittown | ward-insurance-associates-inc.json |
| 15 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 16 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 17 | ansarispharma.com | works |  | ansarispharma-com.json |
| 18 | Centurion Construction Group | construction-company | Lewisberry | centurion-construction-group.json |
| 19 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 20 | Andorra Pediatrics | doctor | Philadelphia | andorra-pediatrics.json |
| 21 | Acorn Landscaping | gardener | Norristown | acorn-landscaping.json |
| 22 | James W. Zerillo Law Offices | lawyer | Pottstown | james-w-zerillo-law-offices.json |
| 23 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 24 | Norristown Glass | glaziery | Norristown | norristown-glass.json |
| 25 | Eagle Kitchens & Design Studio, LLC | kitchen | Spring House | eagle-kitchens-and-design-studio-llc.json |
| 26 | Caballero's Inc. | painter | Willow Grove | caballero-s-inc.json |
| 27 | Gehman Chiropractic Office | alternative | Hatfield | gehman-chiropractic-office.json |
| 28 | Charles Cohen Plumbing and Heating | plumber | Jenkintown | charles-cohen-plumbing-and-heating.json |
| 29 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 30 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 31 | A Plus Family Drain Cleaning | plumber | Upper Darby | a-plus-family-drain-cleaning.json |
| 32 | A & J Custom Painting | painter | Bensalem | a-and-j-custom-painting.json |
| 33 | Chris Orser Landscaping | gardener | Doylestown | chris-orser-landscaping.json |
| 34 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 35 | Sharp Stream Power Washing & Painting | painter | West Chester | sharp-stream-power-washing-and-painting.json |
| 36 | Big Head Transport, LLC | tyres | Philadelphia | big-head-transport-llc.json |
| 37 | Kehan's Auto Service | car-repair | Philadelphia | kehan-s-auto-service.json |
| 38 | Judy's Hair and Wig Salon | beauty | Philadelphia | judy-s-hair-and-wig-salon.json |
| 39 | Elite Auto Parts | car-parts | Philadelphia | elite-auto-parts.json |
| 40 | MYTECH Automotive Service Center | car-repair | Limerick | mytech-automotive-service-center.json |
| 41 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 42 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 43 | Lans Nails | beauty | Lansdale | lans-nails.json |
| 44 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 45 | Valley Auto Group, Inc. | car-repair | Pennsburg | valley-auto-group-inc.json |
| 46 | Powerstroke Diesel Specialties | car-repair | Pottstown | powerstroke-diesel-specialties.json |
| 47 | Metro Motors | car | Upper Darby | metro-motors.json |
| 48 | Fenza's Auto Body | car-repair | Chester | fenza-s-auto-body.json |
| 49 | Wallace Auto Service | car-repair | Bryn Mawr | wallace-auto-service.json |
| 50 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 51 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 52 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 53 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 54 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 55 | Golden Eagle Jewelry | jewelry | Philadelphia | golden-eagle-jewelry.json |
| 56 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 57 | Sense Zero Float Center | beauty | Yardley | sense-zero-float-center.json |
| 58 | Mexico Magico | tax-advisor | Avondale | mexico-magico.json |
| 59 | Attitude Alley Motorcycle Co LLC | motorcycle | Lititz | attitude-alley-motorcycle-co-llc.json |
| 60 | Law Offices of D. A. Casselle | lawyer | Allentown | law-offices-of-d-a-casselle.json |
| 61 | 4/4 Architecture | architect | Bethlehem | 4-4-architecture.json |
| 62 | Randy's Greenhouse LLC | gardener | Athens | randy-s-greenhouse-llc.json |
| 63 | Magness Garage (Volkswagen) | car-repair | New Bethlehem | magness-garage-volkswagen.json |
| 64 | Saul's Landscaping | garden-centre | Palmyra | saul-s-landscaping.json |
| 65 | Delong's Automotive | car-repair | Morgantown | delong-s-automotive.json |
| 66 | Emergency Rooter Services | plumber | York | emergency-rooter-services.json |
| 67 | The Village II | jewelry |  | the-village-ii.json |
| 68 | Summit Landscaping Inc. | gardener | Dallas | summit-landscaping-inc.json |
| 69 | Fortitude & Co | fitness-centre | Philadelphia | fortitude-and-co.json |
| 70 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 71 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 72 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 73 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 74 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 75 | NewAge® Industries | works | Southampton | newage-industries.json |
| 76 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 77 | Bimbo Bakeries USA | bakery | Bethlehem | bimbo-bakeries-usa.json |
| 78 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 79 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 80 | Clear Vision Auto Glass | car-repair | Chadds Ford | clear-vision-auto-glass.json |
| 81 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 82 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 83 | Danger Salon | hairdresser | Philadelphia | danger-salon.json |
| 84 | Schaeffer Floor Coverings | flooring | Bechtelsville | schaeffer-floor-coverings.json |
| 85 | Out-tac Outfitters | outdoor |  | out-tac-outfitters.json |
| 86 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 87 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 88 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 89 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 90 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 91 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 92 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 93 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 94 | Bar 31 | bar | Ambler | bar-31.json |
| 95 | August Moon | restaurant | Norristown | august-moon.json |
| 96 | Theory | clothes | Pottstown | theory.json |
| 97 | Highline Motors | car-repair | Aston | highline-motors.json |
| 98 | Fit4Mom | fitness-centre | Warrington | fit4mom.json |
| 99 | Belle Palace Nail Spa | beauty | Warrington | belle-palace-nail-spa.json |
| 100 | Anthropology | clothes | Devon | anthropology.json |
