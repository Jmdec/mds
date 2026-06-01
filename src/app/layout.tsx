import type React from "react";
import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import ServiceWorkerProvider from "@/components/ServiceWorkerProvider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://mdsdental.com"),

  title: {
    default: "MDS Dental & Aesthetic Clinic - Premium Dental Care in Batangas",
    template: "%s | MDS Dental & Aesthetic Clinic",
  },

  description:
    "MDS Dental & Aesthetic Clinic provides advanced dental and aesthetic care in Batangas, Philippines. We specialize in general dentistry, orthodontics, and skin aesthetic treatments delivered with modern technology and patient-centered care.",

  keywords: [
    "dental clinic Batangas",
    "best dental clinic Batangas Philippines",
    "dentist Batangas",
    "aesthetic clinic Batangas",
    "dental care Batangas City",
    "teeth whitening Batangas",
    "orthodontist Batangas",
    "skin clinic Batangas",
    "general dentistry",
    "cosmetic dentistry Philippines",
    "dental implants Philippines",
    "braces Batangas",
    "Invisalign Philippines",
    "teeth cleaning Batangas",
    "tooth extraction Batangas",
    "dental veneers Philippines",
    "root canal Batangas",
    "pediatric dentist Batangas",
    "facial treatment Batangas",
    "skin rejuvenation Philippines",
    "botox Batangas",
    "dermal fillers Philippines",
    "acne treatment Batangas",
    "chemical peel Philippines",
    "laser skin treatment Batangas",
    "anti-aging treatment Philippines",
    "premium dental clinic Philippines",
    "modern dental clinic",
    "painless dentistry",
    "affordable dental care Batangas",
    "trusted dentist Philippines",
    "professional aesthetic clinic",
    "dental check-up",
    "smile makeover Philippines",
    "dental consultation Batangas",
    "aesthetic consultation",
    "dental emergency Batangas",
    "MDS Dental",
    "MDS Aesthetic Clinic",
    "MDS Dental & Aesthetic Clinic",
    "MDS Clinic Batangas",
  ],

  authors: [{ name: "MDS Dental & Aesthetic Clinic" }],
  creator: "MDS Dental & Aesthetic Clinic",
  publisher: "MDS Dental & Aesthetic Clinic",
  applicationName: "MDS Dental & Aesthetic Clinic",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",

  openGraph: {
    type: "website",
    locale: "en_PH",
    alternateLocale: ["en_US"],
    url: "https://mdsdental.com",
    siteName: "MDS Dental & Aesthetic Clinic",
    title:
      "MDS Dental & Aesthetic Clinic - Premium Dental & Aesthetic Care in Batangas",
    description:
      "World-class dental and aesthetic services in Batangas, Philippines. Trusted by thousands for general dentistry, cosmetic procedures, and aesthetic treatments.",
    images: [
      {
        url: "https://mdsdental.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "MDS Dental & Aesthetic Clinic - Batangas Philippines",
        type: "image/jpeg",
      },
      {
        url: "https://mdsdental.com/clinic-exterior.jpg",
        width: 1200,
        height: 630,
        alt: "MDS Dental & Aesthetic Clinic Exterior",
        type: "image/jpeg",
      },
      {
        url: "https://mdsdental.com/clinic-interior.jpg",
        width: 1200,
        height: 630,
        alt: "MDS Dental & Aesthetic Clinic Interior",
        type: "image/jpeg",
      },
      {
        url: "https://mdsdental.com/dental-services.jpg",
        width: 1200,
        height: 630,
        alt: "Dental and Aesthetic Services at MDS Clinic",
        type: "image/jpeg",
      },
    ],
    countryName: "Philippines",
  },

  twitter: {
    card: "summary_large_image",
    title: "MDS Dental & Aesthetic Clinic - Batangas, Philippines",
    description:
      "Premium dental and aesthetic care in Batangas, Philippines. General dentistry, cosmetic dentistry, orthodontics, and aesthetic treatments — all under one roof.",
    images: ["https://mdsdental.com/og-image.jpg"],
    creator: "@mdsdental",
    site: "@mdsdental",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MDS Dental & Aesthetic",
    startupImage: [
      {
        url: "/apple-touch-icon.png",
        media: "(device-width: 768px) and (device-height: 1024px)",
      },
    ],
  },

  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  category: "health",
  classification: "Dental Clinic and Aesthetic Clinic",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    noarchive: false,
    noimageindex: false,
    nosnippet: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://mdsdental.com",
    languages: {
      "en-PH": "https://mdsdental.com",
      "en-US": "https://mdsdental.com/en",
    },
  },

  verification: {
    google: "your-google-search-console-verification-code",
    other: {
      "facebook-domain-verification": "your-facebook-domain-verification",
    },
  },

  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "MDS Dental & Aesthetic",
    "application-name": "MDS Dental & Aesthetic Clinic",
    "msapplication-TileColor": "#1a6fa8",
    "msapplication-config": "/browserconfig.xml",
  },
};

export const viewport = {
  themeColor: "#0a2540",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const businessSchema = {
    "@context": "https://schema.org",
    "@type": "Dentist",
    "@id": "https://mdsdental.com/#clinic",
    name: "MDS Dental & Aesthetic Clinic",
    image: [
      "https://mdsdental.com/clinic-exterior.jpg",
      "https://mdsdental.com/clinic-interior.jpg",
      "https://mdsdental.com/dental-services.jpg",
    ],
    description:
      "Premium dental and aesthetic clinic in Batangas, Philippines. Offering general dentistry, cosmetic dentistry, orthodontics, dental implants, and a full range of aesthetic skin treatments in a modern, comfortable environment.",
    medicalSpecialty: [
      "Dentistry",
      "Cosmetic Dentistry",
      "Orthodontics",
      "Aesthetic Medicine",
      "Dermatology",
    ],
    priceRange: "₱₱-₱₱₱",
    currenciesAccepted: "PHP",
    paymentAccepted: "Cash, Credit Card, Debit Card, GCash, Maya, PhilHealth",
    telephone: "+63-XX-XXX-XXXX",
    email: "appointments@mdsdental.com",
    url: "https://mdsdental.com",
    hasMap: "https://maps.google.com/?q=MDS+Dental+Aesthetic+Clinic+Batangas",
    acceptsReservations: true,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "17:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Sunday"],
        opens: "10:00",
        closes: "15:00",
      },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "Your Street Address",
      addressLocality: "Batangas City",
      addressRegion: "Batangas",
      postalCode: "4200",
      addressCountry: "PH",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "13.7565",
      longitude: "121.0583",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "214",
      bestRating: "5",
      worstRating: "1",
    },
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: "Free Wi-Fi",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Air Conditioned",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Wheelchair Accessible",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Parking Available",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Child-Friendly",
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Online Booking",
        value: true,
      },
    ],
    potentialAction: {
      "@type": "ReserveAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://mdsdental.com/appointments",
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
      result: {
        "@type": "Reservation",
        name: "Dental or Aesthetic Appointment",
      },
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    "@id": "https://mdsdental.com/#organization",
    name: "MDS Dental & Aesthetic Clinic",
    url: "https://mdsdental.com",
    logo: "https://mdsdental.com/logo.png",
    image: "https://mdsdental.com/og-image.jpg",
    description:
      "Premium dental and aesthetic clinic serving Batangas, Philippines with expert dental care and advanced aesthetic treatments.",
    email: "info@mdsdental.com",
    telephone: "+63-XX-XXX-XXXX",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Your Street Address",
      addressLocality: "Batangas City",
      addressRegion: "Batangas",
      postalCode: "4200",
      addressCountry: "PH",
    },
    sameAs: [
      "https://www.facebook.com/mdsdental",
      "https://www.instagram.com/mdsdental",
      "https://twitter.com/mdsdental",
    ],
    foundingDate: "2020",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: "10-25",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://mdsdental.com/#website",
    url: "https://mdsdental.com",
    name: "MDS Dental & Aesthetic Clinic - Batangas, Philippines",
    description:
      "Premium dental and aesthetic clinic in Batangas offering comprehensive dental care and skin aesthetic treatments.",
    publisher: {
      "@id": "https://mdsdental.com/#organization",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://mdsdental.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en-PH",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://mdsdental.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Dental Services",
        item: "https://mdsdental.com/dental-services",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Aesthetic Services",
        item: "https://mdsdental.com/aesthetic-services",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "Book an Appointment",
        item: "https://mdsdental.com/appointments",
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What services does MDS Dental & Aesthetic Clinic offer?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MDS Dental & Aesthetic Clinic offers a comprehensive range of services including general dentistry, cosmetic dentistry, orthodontics (braces and Invisalign), dental implants, teeth whitening, and aesthetic treatments such as facial rejuvenation, skin care, botox, and dermal fillers.",
        },
      },
      {
        "@type": "Question",
        name: "Where is MDS Dental & Aesthetic Clinic located?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MDS Dental & Aesthetic Clinic is located in Batangas City, Batangas, Philippines. Visit our website or contact us directly for the exact address and directions.",
        },
      },
      {
        "@type": "Question",
        name: "How do I book an appointment?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can book an appointment online through our website, call us directly, or send us a message via our social media pages. Walk-ins are also welcome subject to availability.",
        },
      },
      {
        "@type": "Question",
        name: "What are your clinic hours?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We are open Monday to Friday from 9:00 AM to 6:00 PM, Saturday from 9:00 AM to 5:00 PM, and Sunday from 10:00 AM to 3:00 PM.",
        },
      },
      {
        "@type": "Question",
        name: "What payment methods do you accept?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We accept cash, major credit cards, debit cards, GCash, Maya, and PhilHealth for eligible procedures.",
        },
      },
      {
        "@type": "Question",
        name: "Is MDS Dental & Aesthetic Clinic child-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! We have a welcoming, child-friendly environment and offer pediatric dental services to ensure your little ones receive the best dental care in a comfortable setting.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer dental payment plans or installment options?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we offer flexible payment arrangements for certain procedures. Please speak with our front desk staff or contact us directly to learn about available installment plans.",
        },
      },
    ],
  };

  const medicalServiceSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "@id": "https://mdsdental.com/#services",
    name: "MDS Dental & Aesthetic Clinic Services",
    description:
      "Comprehensive dental and aesthetic services in Batangas, Philippines",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dental & Aesthetic Services",
      itemListElement: [
        {
          "@type": "OfferCatalog",
          name: "General Dentistry",
          description:
            "Routine check-ups, teeth cleaning, fillings, extractions, and preventive dental care",
        },
        {
          "@type": "OfferCatalog",
          name: "Cosmetic Dentistry",
          description:
            "Teeth whitening, veneers, smile makeovers, and dental bonding",
        },
        {
          "@type": "OfferCatalog",
          name: "Orthodontics",
          description:
            "Metal braces, ceramic braces, Invisalign, and retainers",
        },
        {
          "@type": "OfferCatalog",
          name: "Restorative Dentistry",
          description:
            "Dental implants, crowns, bridges, dentures, and root canal treatment",
        },
        {
          "@type": "OfferCatalog",
          name: "Aesthetic Treatments",
          description:
            "Facial rejuvenation, botox, dermal fillers, chemical peels, and skin care treatments",
        },
        {
          "@type": "OfferCatalog",
          name: "Pediatric Dentistry",
          description:
            "Gentle and comprehensive dental care for children of all ages",
        },
      ],
    },
    inLanguage: "en-PH",
  };

  return (
    <html lang="en-PH">
      <head>
        {/*
         * ─── PWA INSTALL PROMPT — MUST BE FIRST IN <head> ───────────────────────
         * Captures `beforeinstallprompt` synchronously before any JS bundle loads.
         * React hydration is too slow; this script runs immediately so the event
         * is never missed. The PWAInstallContext reads window.__pwaInstallPrompt
         * on mount and triggers the banner automatically.
         */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (window.matchMedia('(display-mode: standalone)').matches) return;
                if (window.navigator.standalone === true) return;
                window.addEventListener('beforeinstallprompt', function(e) {
                  e.preventDefault();
                  window.__pwaInstallPrompt = e;
                  window.dispatchEvent(new Event('pwaInstallReady'));
                });
              })();
            `,
          }}
        />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(medicalServiceSchema),
          }}
        />

        {/* Open Graph Image Tags */}
        <meta
          property="og:image"
          content="https://mdsdental.com/og-image.jpg"
        />
        <meta
          property="og:image:secure_url"
          content="https://mdsdental.com/og-image.jpg"
        />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="MDS Dental & Aesthetic Clinic - Batangas Philippines"
        />

        {/* Twitter Card Image */}
        <meta
          name="twitter:image"
          content="https://mdsdental.com/og-image.jpg"
        />
        <meta
          name="twitter:image:alt"
          content="MDS Dental & Aesthetic Clinic"
        />

        {/* Performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="preload" as="image" href="/logo.png" />

        {/* Geographic */}
        <meta name="geo.region" content="PH-BAN" />
        <meta
          name="geo.placename"
          content="Batangas City, Batangas, Philippines"
        />
        <meta name="geo.position" content="13.7565;121.0583" />
        <meta name="ICBM" content="13.7565, 121.0583" />

        {/* Misc */}
        <meta name="format-detection" content="telephone=yes" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="True" />
        <meta name="MobileOptimized" content="320" />

        {/* SEO */}
        <link rel="canonical" href="https://mdsdental.com" />
        <link
          rel="sitemap"
          type="application/xml"
          href="https://mdsdental.com/sitemap.xml"
        />
        <link rel="alternate" hrefLang="en-ph" href="https://mdsdental.com" />
        <link rel="alternate" hrefLang="en" href="https://mdsdental.com/en" />
        <link
          rel="alternate"
          hrefLang="x-default"
          href="https://mdsdental.com"
        />
      </head>

      <body className="bg-[#0a2540] text-white font-sans antialiased">
        <ServiceWorkerProvider />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
