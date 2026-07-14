import { business, serviceAreas, services } from "@/lib/site";

export function StructuredData() {
  const base = `https://${business.domain}`;
  const businessId = `${base}/#business`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["HVACBusiness", "LocalBusiness"],
        "@id": businessId,
        name: business.name,
        alternateName: business.shortName,
        url: base,
        logo: {
          "@type": "ImageObject",
          url: `${base}/img/logo.png`,
          width: 512,
          height: 278,
        },
        image: `${base}/img/mascot.jpg`,
        telephone: business.phone,
        email: business.email,
        slogan: business.tagline,
        priceRange: "$$",
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address.street,
          addressLocality: business.address.city,
          addressRegion: business.address.state,
          postalCode: business.address.zip,
          addressCountry: "US",
        },
        areaServed: serviceAreas.map((area) => ({
          "@type": area.name.includes("County") ? "AdministrativeArea" : "City",
          name: `${area.name}, Illinois`,
        })),
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "00:00",
          closes: "23:59",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: business.phone,
          contactType: "customer service",
          areaServed: "US",
          availableLanguage: "English",
        },
        sameAs: [business.social.facebook, business.social.instagram],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Residential HVAC services",
          itemListElement: services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.name,
              description: service.short,
              provider: { "@id": businessId },
              areaServed: "Kane County, Illinois",
            },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${base}/#website`,
        url: base,
        name: business.name,
        publisher: { "@id": businessId },
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
