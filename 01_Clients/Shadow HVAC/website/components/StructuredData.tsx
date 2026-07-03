import { business, reviews } from "@/lib/site";

export function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    name: business.name,
    image: `https://${business.domain}/icon.svg`,
    "@id": `https://${business.domain}`,
    url: `https://${business.domain}`,
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
    areaServed: [
      "Hampshire",
      "Burlington",
      "Huntley",
      "Pingree Grove",
      "Gilberts",
      "Elgin",
      "Kane County",
    ],
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5",
      reviewCount: String(reviews.length),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
