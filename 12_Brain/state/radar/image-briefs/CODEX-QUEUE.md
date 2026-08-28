# Codex image queue — generated 2026-08-28

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
| 7 | Casey Williams, DMD | dentist | Boiling Springs | casey-williams-dmd.json |
| 8 | JT1 Electric Inc. | electrician | Pocono Lake | jt1-electric-inc.json |
| 9 | Lee's Hoagie House | restaurant |  | lee-s-hoagie-house.json |
| 10 | Broker Resource Center | insurance | King of Prussia | broker-resource-center.json |
| 11 | P & C Insurance Agency LLC | insurance | Aldan | p-and-c-insurance-agency-llc.json |
| 12 | Anthony Gueriera Jr. Insurance Agency LLC | insurance | Broomall | anthony-gueriera-jr-insurance-agency-llc.json |
| 13 | Ashley Hunter's Tags & Insurance | insurance | Folsom | ashley-hunter-s-tags-and-insurance.json |
| 14 | Bàn Bàn Asian Bistro | restaurant |  | b-n-b-n-asian-bistro.json |
| 15 | Rice House | restaurant | Collegeville | rice-house.json |
| 16 | Ward Insurance Associates Inc. | insurance | Levittown | ward-insurance-associates-inc.json |
| 17 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 18 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 19 | ansarispharma.com | works |  | ansarispharma-com.json |
| 20 | Centurion Construction Group | construction-company | Lewisberry | centurion-construction-group.json |
| 21 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 22 | Andorra Pediatrics | doctor | Philadelphia | andorra-pediatrics.json |
| 23 | Acorn Landscaping | gardener | Norristown | acorn-landscaping.json |
| 24 | James W. Zerillo Law Offices | lawyer | Pottstown | james-w-zerillo-law-offices.json |
| 25 | Specialty Floors Inc. | floorer | Abington | specialty-floors-inc.json |
| 26 | Norristown Glass | glaziery | Norristown | norristown-glass.json |
| 27 | Eagle Kitchens & Design Studio, LLC | kitchen | Spring House | eagle-kitchens-and-design-studio-llc.json |
| 28 | Caballero's Inc. | painter | Willow Grove | caballero-s-inc.json |
| 29 | Gehman Chiropractic Office | alternative | Hatfield | gehman-chiropractic-office.json |
| 30 | Charles Cohen Plumbing and Heating | plumber | Jenkintown | charles-cohen-plumbing-and-heating.json |
| 31 | Fletcher Masonry | stonemason | Chadds Ford | fletcher-masonry.json |
| 32 | Moore Brothers Construction | paver | Chester | moore-brothers-construction.json |
| 33 | A Plus Family Drain Cleaning | plumber | Upper Darby | a-plus-family-drain-cleaning.json |
| 34 | A & J Custom Painting | painter | Bensalem | a-and-j-custom-painting.json |
| 35 | Chris Orser Landscaping | gardener | Doylestown | chris-orser-landscaping.json |
| 36 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 37 | Sharp Stream Power Washing & Painting | painter | West Chester | sharp-stream-power-washing-and-painting.json |
| 38 | Big Head Transport, LLC | tyres | Philadelphia | big-head-transport-llc.json |
| 39 | Kehan's Auto Service | car-repair | Philadelphia | kehan-s-auto-service.json |
| 40 | Judy's Hair and Wig Salon | beauty | Philadelphia | judy-s-hair-and-wig-salon.json |
| 41 | Elite Auto Parts | car-parts | Philadelphia | elite-auto-parts.json |
| 42 | MYTECH Automotive Service Center | car-repair | Limerick | mytech-automotive-service-center.json |
| 43 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 44 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 45 | Lans Nails | beauty | Lansdale | lans-nails.json |
| 46 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 47 | Valley Auto Group, Inc. | car-repair | Pennsburg | valley-auto-group-inc.json |
| 48 | Powerstroke Diesel Specialties | car-repair | Pottstown | powerstroke-diesel-specialties.json |
| 49 | Metro Motors | car | Upper Darby | metro-motors.json |
| 50 | Fenza's Auto Body | car-repair | Chester | fenza-s-auto-body.json |
| 51 | Wallace Auto Service | car-repair | Bryn Mawr | wallace-auto-service.json |
| 52 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 53 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 54 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 55 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 56 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 57 | Golden Eagle Jewelry | jewelry | Philadelphia | golden-eagle-jewelry.json |
| 58 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 59 | Sense Zero Float Center | beauty | Yardley | sense-zero-float-center.json |
| 60 | Mexico Magico | tax-advisor | Avondale | mexico-magico.json |
| 61 | Attitude Alley Motorcycle Co LLC | motorcycle | Lititz | attitude-alley-motorcycle-co-llc.json |
| 62 | Law Offices of D. A. Casselle | lawyer | Allentown | law-offices-of-d-a-casselle.json |
| 63 | 4/4 Architecture | architect | Bethlehem | 4-4-architecture.json |
| 64 | Randy's Greenhouse LLC | gardener | Athens | randy-s-greenhouse-llc.json |
| 65 | Magness Garage (Volkswagen) | car-repair | New Bethlehem | magness-garage-volkswagen.json |
| 66 | Saul's Landscaping | garden-centre | Palmyra | saul-s-landscaping.json |
| 67 | Delong's Automotive | car-repair | Morgantown | delong-s-automotive.json |
| 68 | Emergency Rooter Services | plumber | York | emergency-rooter-services.json |
| 69 | The Village II | jewelry |  | the-village-ii.json |
| 70 | Summit Landscaping Inc. | gardener | Dallas | summit-landscaping-inc.json |
| 71 | iRepair | electronics-repair | Stroudsburg | irepair.json |
| 72 | Fortitude & Co | fitness-centre | Philadelphia | fortitude-and-co.json |
| 73 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 74 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 75 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 76 | F M Berkheimer Inc | hvac | Mechanicsburg | f-m-berkheimer-inc.json |
| 77 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 78 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 79 | NewAge® Industries | works | Southampton | newage-industries.json |
| 80 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 81 | Bimbo Bakeries USA | bakery | Bethlehem | bimbo-bakeries-usa.json |
| 82 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 83 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 84 | Clear Vision Auto Glass | car-repair | Chadds Ford | clear-vision-auto-glass.json |
| 85 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 86 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 87 | Danger Salon | hairdresser | Philadelphia | danger-salon.json |
| 88 | Schaeffer Floor Coverings | flooring | Bechtelsville | schaeffer-floor-coverings.json |
| 89 | Out-tac Outfitters | outdoor |  | out-tac-outfitters.json |
| 90 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 91 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 92 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
| 93 | Glocker and Co. Inc. Realtors | estate-agent | Boyertown | glocker-and-co-inc-realtors.json |
| 94 | Accurate Temperature | hvac | Bensalem | accurate-temperature.json |
| 95 | Wynnewood Eyecare | optometrist |  | wynnewood-eyecare.json |
| 96 | BPM Fitness | fitness-centre |  | bpm-fitness.json |
| 97 | First Class Auto Land | car | Philadelphia | first-class-auto-land.json |
| 98 | Bar 31 | bar | Ambler | bar-31.json |
| 99 | August Moon | restaurant | Norristown | august-moon.json |
| 100 | Theory | clothes | Pottstown | theory.json |
