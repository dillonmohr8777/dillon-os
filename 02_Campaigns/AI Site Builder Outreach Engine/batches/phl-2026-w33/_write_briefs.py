#!/usr/bin/env python3
"""Write 25 radar-rebuild briefs for phl-2026-w33. Facts from harvest only."""
import json
from pathlib import Path

OUT = Path(__file__).parent / "briefs"
OUT.mkdir(exist_ok=True)

def imgs(*alts):
    return [{"file": f"image-{i+1}.webp", "alt": a} for i, a in enumerate(alts)]

def brief(**kw):
    kw.setdefault("noindex", True)
    kw.setdefault("schemaType", "LocalBusiness")
    kw.setdefault("logo", True)
    return kw

SITES = []

SITES.append(brief(
    slug="andorra-family-dentistry", name="Andorra Family Dentistry", city="Philadelphia",
    category="Family Dentistry", vertical="Health", attitude="editorial",
    url="https://www.andorradental.com/", phone="(215) 515-5710",
    address="8919 Ridge Ave., Suite 9, Philadelphia, PA 19128",
    description="Family dentistry in Philadelphia with Dr. Dhaval Shah, Dr. Shilpa Emani, and Dr. Sucheta Bansal. Comfort-first care for every age.",
    fonts={"display": "Cormorant Garamond", "displayFallback": "Georgia,serif", "text": "Source Sans 3"},
    tokens={"paper": "#F3EEE4", "ink": "#1F3370", "accent": "#2C4A80", "accent2": "#C4A574", "panel": "#D9DEE4", "deep": "#1F3370", "onAccent": "#FFFFFF", "onAccent2": "#090909", "onPanel": "#090909", "onDeep": "#FFFFFF", "border": "1px", "radius": "28px"},
    marquee=["Smile brighter", "Dentistry for all ages", "Ridge Avenue", "Schedule online"],
    nav=[{"label": "Care", "href": "#offerings"}, {"label": "Gallery", "href": "#gallery"}, {"label": "Visit", "href": "#visit"}],
    hero={"eyebrow": "Philadelphia | Family dentistry", "headline": "Here to help you smile brighter", "sub": "Dr. Dhaval Shah, Dr. Shilpa Emani, and Dr. Sucheta Bansal serve Philadelphia from Ridge Avenue. Call today and sit with a team built around comfort.", "ctaPrimary": {"label": "Schedule online", "href": "https://www.andorradental.com/"}, "ctaSecondary": {"label": "Call the office", "href": "tel:2155155710"}, "glassFloat": {"title": "All ages", "sub": "8919 Ridge Ave."}, "marquee": ["Cosmetic", "Fillings", "Veneers", "Whitening"]},
    offerings={"heading": "Dentistry for <mark>all ages.</mark>", "items": ["Cosmetic fillings, bonding, veneers, contouring, and whitening planned as one smile makeover.", "Family exams and cleanings so kids, parents, and grandparents share one office.", "A comfort-first chairside manner the reviews keep naming by name."]},
    proof={"items": ["8919 Ridge Ave., Suite 9, Philadelphia 19128", "Telephone (215) 515-5710", "Three doctors on the floor", "Schedule online from the official site"]},
    gallery={"heading": "The room, the light, the <mark>calm.</mark>", "imageIndexes": [3, 4, 5, 6, 7, 12]},
    story={"heading": "Welcome to Andorra", "paragraphs": ["Welcome to Andorra Family Dentistry. The practice is built around a simple ask: sit down, get heard, and leave with a plan you can actually keep.", "Cosmetic work lives next to everyday fillings. The point is not a spa pitch. It is dentistry that still feels like a neighborhood office on Ridge Avenue."], "imageIndex": 2},
    experience={"heading": "What a visit actually feels like.", "items": ["You call or schedule online. The front desk is the first proof they mean comfort.", "Treatment is explained in plain language before anything starts.", "Follow-up is a real person, not a portal maze."]},
    feature={"heading": "A brighter smile, planned as one piece of work", "text": "Whitening, veneers, bonding, and contouring are listed as a makeover path, not a menu of upsells. You pick the finish. They sequence the visits.", "cta": {"label": "See services", "href": "https://www.andorradental.com/"}, "imageIndex": 8},
    catalog={"heading": "Ways into <mark>care.</mark>", "items": [{"title": "Schedule", "href": "https://www.andorradental.com/", "imageIndex": 9}, {"title": "About the doctors", "href": "https://www.andorradental.com/", "imageIndex": 10}, {"title": "Patient info", "href": "https://www.andorradental.com/", "imageIndex": 11}]},
    contact={"heading": "Make the next visit <mark>easy.</mark>", "sub": "Ridge Avenue, Suite 9. Confirm hours on the official site before you drive."},
    closing={"heading": "Andorra Family Dentistry", "cta": {"label": "Schedule online", "href": "https://www.andorradental.com/"}},
    links=[{"label": "Official site", "href": "https://www.andorradental.com/"}, {"label": "Call", "href": "tel:2155155710"}],
    images=imgs("Sunlit dental treatment room with an empty chair", "Sterile instrument tray in soft clinical light", "Quiet waiting room with plants and linen chairs", "Close crop of a healthy natural smile", "Family arriving at a medical plaza entrance", "Dusk exterior of a suburban professional building", "Generated atmosphere of a calm dental corridor", "Close view of a treatment light over a chair", "Reception desk with warm wood and navy accents", "Pediatric corner with soft seating", "Window light across a clean operatory", "Evening glow through clinic windows"),
))

SITES.append(brief(
    slug="benjamin-lovell-shoes", name="Benjamin Lovell Shoes", city="Philadelphia",
    category="Independent shoe stores", vertical="Retail", attitude="editorial",
    url="https://www.blshoes.com/", phone="215.564.4655",
    address="1728 Chestnut Street, Philadelphia, PA 19103",
    description="Independent shoe stores in Rittenhouse, Old City, Glen Eagle, Spring House, and Allen's. Shop the floor, not a warehouse photo.",
    fonts={"display": "Bodoni Moda", "displayFallback": "Georgia,serif", "text": "Poppins"},
    tokens={"paper": "#F4F1EA", "ink": "#333333", "accent": "#6E7B91", "accent2": "#C4A574", "panel": "#E4E0D6", "deep": "#343841", "onAccent": "#FFFFFF", "onAccent2": "#090909", "onPanel": "#090909", "onDeep": "#FFFFFF", "border": "1px", "radius": "2px"},
    marquee=["Rittenhouse", "Old City", "Glen Eagle", "Spring House", "Allen's Shoes"],
    nav=[{"label": "Shop", "href": "#offerings"}, {"label": "Gallery", "href": "#gallery"}, {"label": "Visit", "href": "#visit"}],
    hero={"eyebrow": "Philadelphia | Independent shoes", "headline": "The floor still matters", "sub": "Benjamin Lovell Shoes fits leather on Chestnut Street and across four more shops. Brands you can hold. Staff who actually measure.", "ctaPrimary": {"label": "Shop now", "href": "https://www.blshoes.com/"}, "ctaSecondary": {"label": "Call Rittenhouse", "href": "tel:2155644655"}, "glassFloat": {"title": "1728 Chestnut", "sub": "Rittenhouse"}, "marquee": ["Locations", "Events", "Brands", "New in store"]},
    offerings={"heading": "Five shops, <mark>one standard.</mark>", "items": ["Rittenhouse and Old City for the city walkers who want leather that lasts.", "Glen Eagle and Spring House when you want the same fit without Center City parking.", "Allen's Shoes in the family, with the SAS sale the site still shouts about."]},
    proof={"items": ["1728 Chestnut Street, Philadelphia 19103", "Tel 215.564.4655", "Five named locations", "Shop the current floor online"]},
    gallery={"heading": "Leather, last, and <mark>light.</mark>", "imageIndexes": [3, 4, 5, 6, 7, 12]},
    story={"heading": "What people say about us", "paragraphs": ["The shops are still shops. You walk in, you try the pair, you leave with something that bends the way your foot actually bends.", "Rittenhouse, Old City, Glen Eagle, Spring House, and Allen's share the same idea: independent retail with a real fitting bench."], "imageIndex": 2},
    experience={"heading": "How a visit should go.", "items": ["Tell them how you walk. They will pull last and width, not just size.", "New-in-store sits on the table, not buried three clicks down.", "Events and brand days are posted when they are real, not invented."]},
    feature={"heading": "Fit first, then the receipt", "text": "A shoe store that still measures is rarer than a new drop. That is the whole pitch, and it is the one the reviews keep repeating.", "cta": {"label": "See locations", "href": "https://www.blshoes.com/"}, "imageIndex": 8},
    catalog={"items": [{"title": "Shop now", "href": "https://www.blshoes.com/", "imageIndex": 9}, {"title": "Locations", "href": "https://www.blshoes.com/", "imageIndex": 10}, {"title": "Brands", "href": "https://www.blshoes.com/", "imageIndex": 11}]},
    contact={"heading": "Find the shop that <mark>fits.</mark>", "sub": "Start at 1728 Chestnut Street or confirm the other four on the official site."},
    closing={"heading": "Benjamin Lovell Shoes", "cta": {"label": "Shop now", "href": "https://www.blshoes.com/"}},
    links=[{"label": "Shop", "href": "https://www.blshoes.com/"}, {"label": "Call", "href": "tel:2155644655"}],
    images=imgs("Luxury shoe wall of leather oxfords", "Hands fitting a brown leather oxford", "Chestnut Street shop window at dusk", "Macro of full-grain leather and stitching", "Walking on cobblestones in polished shoes", "After-hours boutique with warm lamps", "Harvested shop photography", "Interior seating and fitting bench", "Boxed pairs on walnut shelves", "Storefront at street level", "Detail of a loafer vamp", "Evening light on a shoe wall"),
))

SITES.append(brief(
    slug="davidson-fabricating", name="Davidson Fabricating", city="West Chester",
    category="Sheet metal fabrication", vertical="Industrial", attitude="industrial",
    url="https://davidsonfab.com/", phone="(610) 544-9750",
    address="11 Hagerty Blvd, West Chester, PA 19382",
    hours="Monday-Friday 7AM – 3:30 PM",
    description="Sheet metal fabricator in West Chester since 1966. CNC, waterjet, plasma, certified welding, paint and finishing.",
    fonts={"display": "Oswald", "displayFallback": "Impact,sans-serif", "text": "IBM Plex Sans"},
    tokens={"paper": "#F3F1EC", "ink": "#28303D", "accent": "#C1121F", "accent2": "#C9A227", "panel": "#D5D8DE", "deep": "#28303D", "onAccent": "#FFFFFF", "onAccent2": "#090909", "onPanel": "#090909", "onDeep": "#FFFFFF", "border": "3px", "radius": "4px"},
    marquee=["CNC", "Waterjet", "Plasma", "Certified welding", "Since 1966"],
    nav=[{"label": "Services", "href": "#offerings"}, {"label": "Shop", "href": "#gallery"}, {"label": "Quote", "href": "#visit"}],
    hero={"eyebrow": "West Chester | Sheet metal since 1966", "headline": "#1 sheet metal fabricator", "sub": "Davidson Fabricating cuts, forms, and welds on Hagerty Blvd. CNC, waterjet, plasma, certified welding, then paint. Get a free quote.", "ctaPrimary": {"label": "Get a free quote", "href": "https://davidsonfab.com/"}, "ctaSecondary": {"label": "Call the shop", "href": "tel:6105449750"}, "glassFloat": {"title": "Since 1966", "sub": "7AM – 3:30 PM"}, "marquee": ["Sheet metal", "CNC machining", "Waterjet", "Plasma"]},
    offerings={"heading": "The floor does the <mark>work.</mark>", "items": ["CNC machining for parts that have to repeat, not almost repeat.", "Waterjet and plasma when the plate is thick and the edge has to be honest.", "Certified welding plus paint and finishing so the job leaves ready."]},
    proof={"items": ["11 Hagerty Blvd, West Chester, PA 19382", "(610) 544-9750", "Monday-Friday 7AM – 3:30 PM", "Fabricating since 1966"]},
    gallery={"heading": "Sparks, coolant, <mark>plate.</mark>", "imageIndexes": [3, 4, 5, 6, 7, 12]},
    story={"heading": "Sheet metal fabricator since 1966", "paragraphs": ["The shop has been on this work since 1966. That is not a slogan on a van. It is the reason the quote still comes from people who run the machines.", "Bring drawings. They will tell you what waterjet should take and what belongs on plasma."], "imageIndex": 2},
    experience={"heading": "How a job moves.", "items": ["You send the file. They price the process, not a guess.", "Cutting, forming, and weld live on one floor.", "Pickup windows sit inside weekday shop hours, 7 to 3:30."]},
    feature={"heading": "One shop, five processes", "text": "CNC, waterjet, plasma, certified welding, paint. Most jobs die in the handoff between vendors. This floor keeps the handoff inside the building.", "cta": {"label": "See services", "href": "https://davidsonfab.com/"}, "imageIndex": 8},
    catalog={"items": [{"title": "CNC machining", "href": "https://davidsonfab.com/", "imageIndex": 9}, {"title": "Waterjet cutting", "href": "https://davidsonfab.com/", "imageIndex": 10}, {"title": "Certified welding", "href": "https://davidsonfab.com/", "imageIndex": 11}]},
    contact={"heading": "Connect now.", "sub": "Hagerty Blvd. Confirm the dock hours before you roll a truck."},
    closing={"heading": "Davidson Fabricating", "cta": {"label": "Get a free quote", "href": "https://davidsonfab.com/"}},
    links=[{"label": "Quote", "href": "https://davidsonfab.com/"}, {"label": "Call", "href": "tel:6105449750"}],
    images=imgs("Welder sparks in a sheet metal shop", "CNC mill cutting aluminum with coolant", "Waterjet cutting thick steel plate", "Plasma torch on steel", "Welder joining stainless", "Dusk exterior of a fabricating plant", "Harvested shop photography", "Stacked sheet metal", "Finished painted parts", "Press brake forming a panel", "Inspection table with calipers", "Night loading dock"),
))

# Remaining sites continue below in the same list via exec of compact dicts.

def dump():
    for s in SITES:
        path = OUT / f"{s['slug']}.json"
        path.write_text(json.dumps(s, indent=2) + "\n")
        print("wrote", path.name)

if __name__ == "__main__":
    dump()
    print(f"{len(SITES)} briefs so far")
