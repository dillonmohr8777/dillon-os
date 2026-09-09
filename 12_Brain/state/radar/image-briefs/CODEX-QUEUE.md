# Codex image queue — generated 2026-09-09

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
| 9 | Advanced Air Services LLC | hvac | Waynesboro | advanced-air-services-llc.json |
| 10 | Lee's Hoagie House | restaurant |  | lee-s-hoagie-house.json |
| 11 | Broker Resource Center | insurance | King of Prussia | broker-resource-center.json |
| 12 | P & C Insurance Agency LLC | insurance | Aldan | p-and-c-insurance-agency-llc.json |
| 13 | Anthony Gueriera Jr. Insurance Agency LLC | insurance | Broomall | anthony-gueriera-jr-insurance-agency-llc.json |
| 14 | Ashley Hunter's Tags & Insurance | insurance | Folsom | ashley-hunter-s-tags-and-insurance.json |
| 15 | Bàn Bàn Asian Bistro | restaurant |  | b-n-b-n-asian-bistro.json |
| 16 | Rice House | restaurant | Collegeville | rice-house.json |
| 17 | Ward Insurance Associates Inc. | insurance | Levittown | ward-insurance-associates-inc.json |
| 18 | Rice & Rice, Ltd. | consulting |  | rice-and-rice-ltd.json |
| 19 | Jarman Sales & Service, Inc | hvac | Philadelphia | jarman-sales-and-service-inc.json |
| 20 | E&S Autoparts | doityourself | Twin Oaks | e-and-s-autoparts.json |
| 21 | ansarispharma.com | works |  | ansarispharma-com.json |
| 22 | Centurion Construction Group | construction-company | Lewisberry | centurion-construction-group.json |
| 23 | HaverCrown Dental | dentist | Havertown | havercrown-dental.json |
| 24 | Andorra Pediatrics | doctor | Philadelphia | andorra-pediatrics.json |
| 25 | Always Dental Care | dentist | Phoenixville | always-dental-care.json |
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
| 37 | A & J Custom Painting | painter | Bensalem | a-and-j-custom-painting.json |
| 38 | Chris Orser Landscaping | gardener | Doylestown | chris-orser-landscaping.json |
| 39 | Morton Electric Pool & Spa Specialists | plumber | Trevose | morton-electric-pool-and-spa-specialists.json |
| 40 | Sharp Stream Power Washing & Painting | painter | West Chester | sharp-stream-power-washing-and-painting.json |
| 41 | Big Head Transport, LLC | tyres | Philadelphia | big-head-transport-llc.json |
| 42 | Kehan's Auto Service | car-repair | Philadelphia | kehan-s-auto-service.json |
| 43 | Judy's Hair and Wig Salon | beauty | Philadelphia | judy-s-hair-and-wig-salon.json |
| 44 | Elite Auto Parts | car-parts | Philadelphia | elite-auto-parts.json |
| 45 | MYTECH Automotive Service Center | car-repair | Limerick | mytech-automotive-service-center.json |
| 46 | Jack McShea's Restaurant & Bar | pub | Ardmore | jack-mcshea-s-restaurant-and-bar.json |
| 47 | Fulton & Susie's Hairstyling Salon | hairdresser | Boyertown | fulton-and-susie-s-hairstyling-salon.json |
| 48 | Lans Nails | beauty | Lansdale | lans-nails.json |
| 49 | Fanta C Beauty Bar | beauty | Abington | fanta-c-beauty-bar.json |
| 50 | Powerstroke Diesel Specialties | car-repair | Pottstown | powerstroke-diesel-specialties.json |
| 51 | Metro Motors | car | Upper Darby | metro-motors.json |
| 52 | Fenza's Auto Body | car-repair | Chester | fenza-s-auto-body.json |
| 53 | Wallace Auto Service | car-repair | Bryn Mawr | wallace-auto-service.json |
| 54 | Allure - Skincare. Nails. Body. | beauty | Lahaska | allure-skincare-nails-body.json |
| 55 | A New Dawn Therapeutic Massage | massage | Doylestown | a-new-dawn-therapeutic-massage.json |
| 56 | CoCo Nails | beauty | Warrington | coco-nails.json |
| 57 | Twisted Shamrock Studios & Spa | cosmetics |  | twisted-shamrock-studios-and-spa.json |
| 58 | Tax Express | tax-advisor | Yardley | tax-express.json |
| 59 | Golden Eagle Jewelry | jewelry | Philadelphia | golden-eagle-jewelry.json |
| 60 | Pisano and Son Shoe Repair | shoes |  | pisano-and-son-shoe-repair.json |
| 61 | Sense Zero Float Center | beauty | Yardley | sense-zero-float-center.json |
| 62 | Mexico Magico | tax-advisor | Avondale | mexico-magico.json |
| 63 | Attitude Alley Motorcycle Co LLC | motorcycle | Lititz | attitude-alley-motorcycle-co-llc.json |
| 64 | Law Offices of D. A. Casselle | lawyer | Allentown | law-offices-of-d-a-casselle.json |
| 65 | 4/4 Architecture | architect | Bethlehem | 4-4-architecture.json |
| 66 | Randy's Greenhouse LLC | gardener | Athens | randy-s-greenhouse-llc.json |
| 67 | Magness Garage (Volkswagen) | car-repair | New Bethlehem | magness-garage-volkswagen.json |
| 68 | Saul's Landscaping | garden-centre | Palmyra | saul-s-landscaping.json |
| 69 | Delong's Automotive | car-repair | Morgantown | delong-s-automotive.json |
| 70 | Emergency Rooter Services | plumber | York | emergency-rooter-services.json |
| 71 | The Village II | jewelry |  | the-village-ii.json |
| 72 | Summit Landscaping Inc. | gardener | Dallas | summit-landscaping-inc.json |
| 73 | iRepair | electronics-repair | Stroudsburg | irepair.json |
| 74 | Pearsall Complete Auto Care Plus | car-repair | Ellwood City | pearsall-complete-auto-care-plus.json |
| 75 | Bray Auto | car-repair | Greencastle | bray-auto.json |
| 76 | Urban Gardner | garden-centre | Pittsburgh | urban-gardner.json |
| 77 | Advanced Specialty Flooring | floorer | Kittanning | advanced-specialty-flooring.json |
| 78 | William G. Schwab & Associates | lawyer | Lehighton | william-g-schwab-and-associates.json |
| 79 | Professional Opticians | optician | Reedsville | professional-opticians.json |
| 80 | Fortitude & Co | fitness-centre | Philadelphia | fortitude-and-co.json |
| 81 | BG Electric Service LLC | electrician | Philadelphia | bg-electric-service-llc.json |
| 82 | Chestnut Hill Animal Hospital | veterinary | Erdenheim | chestnut-hill-animal-hospital.json |
| 83 | County Line Veterinary Hospital | veterinary | Hatboro | county-line-veterinary-hospital.json |
| 84 | F M Berkheimer Inc | hvac | Mechanicsburg | f-m-berkheimer-inc.json |
| 85 | Hortense T. Moss Health Center | doctor | Philadelphia | hortense-t-moss-health-center.json |
| 86 | Grand Sport Auto Body | car-repair | Collegeville | grand-sport-auto-body.json |
| 87 | NewAge® Industries | works | Southampton | newage-industries.json |
| 88 | Malvern Veterinary Hospital | veterinary |  | malvern-veterinary-hospital.json |
| 89 | Bimbo Bakeries USA | bakery | Bethlehem | bimbo-bakeries-usa.json |
| 90 | The Juice Merchant | restaurant | Narberth | the-juice-merchant.json |
| 91 | Sciacca Service Center | car-repair |  | sciacca-service-center.json |
| 92 | Clear Vision Auto Glass | car-repair | Chadds Ford | clear-vision-auto-glass.json |
| 93 | Upscale Consignments Boutiques Maria Fe's | clothes |  | upscale-consignments-boutiques-maria-fe-s.json |
| 94 | West Philadelphia VA Clinic | clinic |  | west-philadelphia-va-clinic.json |
| 95 | Danger Salon | hairdresser | Philadelphia | danger-salon.json |
| 96 | Schaeffer Floor Coverings | flooring | Bechtelsville | schaeffer-floor-coverings.json |
| 97 | Out-tac Outfitters | outdoor |  | out-tac-outfitters.json |
| 98 | Bei Jing Chinese Food | restaurant | Norristown | bei-jing-chinese-food.json |
| 99 | Golden Sea | restaurant | Blue Bell | golden-sea.json |
| 100 | Gallo Insurance Agency | insurance | Philadelphia | gallo-insurance-agency.json |
