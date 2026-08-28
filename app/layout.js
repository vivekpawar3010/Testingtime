import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Toaster } from "sonner";
import FoodBackground from "@/components/FoodBackground";

export const metadata = {
  title: "MessFind | Premium PG & Hostel Mess Management App & Directory",
  description: "Find your ideal daily dining or PG mess based on budget, area, and location. Streamlined subscription trackers, QR check-in scanning, and automated billing software for mess owners and hostel/PG students.",
  keywords: [
    "mess near me",
    "best mess finder",
    "PG mess locator",
    "hostel mess management app",
    "budget daily meals finder",
    "tiffin services directory",
    "mess billing software",
    "QR code meal check-in scanner",
    "Adviks Software Solutions",
    "Pandharpur local mess list",
    "PG food coordinator",
    "mess weekly off scheduler",
    "mess meal planner"
  ],
  authors: [{ name: "Adviks Software Solutions", url: "mailto:advikssoftwaresolutions@gmail.com" }],
  openGraph: {
    title: "MessFind | Premium PG & Hostel Mess Finder & Management SaaS",
    description: "The ultimate tool for mess owners and diners. Find local messes by location/budget, review weekly menu schedules, and track subscriptions with QR check-in scanners.",
    url: "https://messfind.adviks.com",
    siteName: "MessFind",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MessFind | PG & Hostel Mess Management Platform",
    description: "Find messes by budget/location and manage client dining operations smoothly. Developed by Adviks Software Solutions.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://messfind.adviks.com/#website",
      "url": "https://messfind.adviks.com/",
      "name": "MessFind",
      "description": "Find and manage hostel and PG dining messes near you. Complete software solution for mess owners and customer dining schedules.",
      "publisher": {
        "@id": "https://messfind.adviks.com/#organization"
      }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://messfind.adviks.com/#application",
      "name": "MessFind",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "url": "https://messfind.adviks.com/",
      "description": "Premium cloud-based Mess Management System for hostels, PGs, and private dining centers. Features daily/weekly menu planners, QR code meal scanners, invoicing, and subscription logs.",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "INR"
      }
    },
    {
      "@type": "Organization",
      "@id": "https://messfind.adviks.com/#organization",
      "name": "Adviks Software Solutions",
      "url": "https://messfind.adviks.com/",
      "logo": "https://messfind.adviks.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "advikssoftwaresolutions@gmail.com",
        "contactType": "customer service"
      }
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" className="font-sans">
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className="min-h-full flex flex-col relative">
          <FoodBackground />
          {children}
          <Toaster position="top-right" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}