# Align Homepage Blog Slider — Fix Pack (HubSpot module)

**Date:** 2026-07-21  
**Status:** Paste-ready. Do **not** publish while Dillon's live Edge session owns the site.  
**Module:** Blog Slider `238216663800`  
**Asset:** `module_Blog_Slider.min.js`  
**Portal:** 242825734 (na2)

## Evidence (read-only)

Live JS (minified):

```js
var module_238216663800 = void document.addEventListener("DOMContentLoaded", function () {
  var splide = new Splide(".splide", {
    perPage: 3,
    pagination: false,
    gap: "1rem",
    breakpoints: { 700: { perPage: 1, gap: "1rem" } }
  });
  splide.on("mounted move", function () {
    splide.root.querySelectorAll(".splide__slide a").forEach(function (link) {
      link.setAttribute("tabindex", "-1");
    });
    splide.Components.Slides.filter(function (slide) {
      return slide.isVisible();
    }).forEach(function (slide) {
      var link = slide.slide.querySelector("a");
      link && link.setAttribute("tabindex", "0");
    });
  });
  splide.mount();
});
```

Homepage has one `<section class="splide">` with 9 `splide__slide` cards. Splide CDN loads inside the module. `module_Blog_Slider.min.js` loads in the **footer script cluster**.

## Root cause

`DOMContentLoaded` often already fired by the time HubSpot injects footer module JS. The listener never runs, so Splide never mounts. That surfaces as a dead / broken blog slider (and can throw if other code assumes `.splide` is initialized). Secondary risk: global `".splide"` selector is fragile if another Splide instance is added later.

## Paste-ready module JS (replace module JS in Design Manager)

```js
(function () {
  function initBlogSlider(root) {
    if (!root || root.dataset.splideMounted === "1") return;
    if (typeof Splide === "undefined") {
      console.error("[Align Blog Slider] Splide is not loaded");
      return;
    }
    var splide = new Splide(root, {
      perPage: 3,
      pagination: false,
      gap: "1rem",
      breakpoints: {
        700: { perPage: 1, gap: "1rem" }
      }
    });
    splide.on("mounted move", function () {
      root.querySelectorAll(".splide__slide a").forEach(function (link) {
        link.setAttribute("tabindex", "-1");
      });
      splide.Components.Slides.filter(function (slide) {
        return slide.isVisible();
      }).forEach(function (slide) {
        var link = slide.slide.querySelector("a");
        if (link) link.setAttribute("tabindex", "0");
      });
    });
    splide.mount();
    root.dataset.splideMounted = "1";
  }

  function boot() {
    var roots = document.querySelectorAll("section.splide, .splide");
    roots.forEach(initBlogSlider);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
```

## HubSpot steps (when you own the CMS window)

1. Design Manager → Modules → Blog Slider (`238216663800`).
2. Replace module JS with the paste-ready block above.
3. Save as **draft** / unpublished preview first.
4. Preview homepage on a private URL. Confirm:
   • No console error mentioning Splide / Blog Slider  
   • Cards advance on arrow / swipe  
   • Only visible card links are tabbable  
5. Publish only after Dillon confirms. Do not push in front of the live Edge window session.

## QA checklist

• [ ] Desktop: 3 cards visible, arrows work  
• [ ] ≤700px: 1 card visible  
• [ ] Console clean (filter: Splide, Blog Slider)  
• [ ] Keyboard: Tab reaches a visible card link  
• [ ] Insights cards still link to correct posts
