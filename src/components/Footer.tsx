import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Phone, Mail, MapPin, Award, CreditCard, Headphones } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import logoIcon from "@/assets/logo-icon.png";
import { useTranslation } from "@/contexts/TranslationContext";
import SearchModal from "@/components/SearchModal";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  return (
    <footer className="bg-white border-t border-gray-200/50">
      {/* Trust Signals Section */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Shield className="w-10 h-10 mb-3" />
              <h4 className="font-bold text-sm md:text-base mb-1">{t?.secureBooking || "Secure Booking"}</h4>
              <p className="text-xs md:text-sm text-white/80">{t?.sslEncrypted || "SSL Encrypted"}</p>
            </div>
            <div className="flex flex-col items-center">
              <Award className="w-10 h-10 mb-3" />
              <h4 className="font-bold text-sm md:text-base mb-1">{t?.bestPriceGuarantee || "Best Price Guarantee"}</h4>
              <p className="text-xs md:text-sm text-white/80">{t?.lowestPrices || "Lowest Prices"}</p>
            </div>
            <div className="flex flex-col items-center">
              <Headphones className="w-10 h-10 mb-3" />
              <h4 className="font-bold text-sm md:text-base mb-1">{t?.support247 || "24/7 Support"}</h4>
              <p className="text-xs md:text-sm text-white/80">{t?.alwaysHere || "Always Here"}</p>
            </div>
            <div className="flex flex-col items-center">
              <CreditCard className="w-10 h-10 mb-3" />
              <h4 className="font-bold text-sm md:text-base mb-1">{t?.flexiblePayment || "Flexible Payment"}</h4>
              <p className="text-xs md:text-sm text-white/80">{t?.multipleOptions || "Multiple Options"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="inline-block">
              <img
                src={logoIcon}
                alt="HotelRBS Logo"
                className="h-20 w-auto"
              />
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              {t?.footerDescription || "Your trusted partner for finding perfect accommodations worldwide. We connect travelers with exceptional stays, offering the best prices and seamless booking experience."}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors group">
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <a href="mailto:support@hotelrbs.com">support@hotelrbs.com</a>
              </div>
              <div className="flex items-start gap-3 text-muted-foreground">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Riyadh, Saudi Arabia</span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                {t?.verified || "Verified"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Award className="w-3 h-3 mr-1" />
                {t?.isoCertified || "ISO Certified"}
              </Badge>
            </div>
          </div>
          
          {/* Booking Links */}
          <div>
            <h4 className="font-bold text-foreground text-base mb-4">{t?.booking || "Booking"}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/destinations" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.browseDestinations || "Browse Destinations"}</Link></li>
              <li><Link to="/deals" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.specialOffers || "Special Offers"}</Link></li>
              <li>
                <button 
                  onClick={() => setIsSearchModalOpen(true)}
                  className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block text-left"
                >
                  {t?.searchHotels || "Search Hotels"}
                </button>
              </li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.groupBookings || "Group Bookings"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.corporateTravel || "Corporate Travel"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.giftCards || "Gift Cards"}</Link></li>
            </ul>
          </div>
          
          {/* Support Links */}
          <div>
            <h4 className="font-bold text-foreground text-base mb-4">{t?.support || "Support"}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.helpCenter || "Help Center"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.customerService || "Customer Service"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.bookingChanges || "Booking Changes"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.cancellationPolicy || "Cancellation Policy"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.travelInsurance || "Travel Insurance"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.faq || "FAQ"}</Link></li>
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="font-bold text-foreground text-base mb-4">{t?.company || "Company"}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.aboutUs || "About Us"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.careers || "Careers"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.pressMedia || "Press & Media"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.partnerWithUs || "Partner with Us"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.investorRelations || "Investor Relations"}</Link></li>
              <li><Link to="#" className="text-muted-foreground hover:text-primary transition-colors hover:translate-x-1 inline-block">{t?.blog || "Blog"}</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-300 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Copyright & Legal Links */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
              <p>&copy; {currentYear} HotelRBS, Inc. {t?.allRightsReserved || "All rights reserved."}</p>
              <div className="flex items-center gap-4">
                <Link to="#" className="hover:text-primary transition-colors">{t?.privacyPolicy || "Privacy Policy"}</Link>
                <span className="text-gray-300">|</span>
                <Link to="#" className="hover:text-primary transition-colors">{t?.termsOfService || "Terms of Service"}</Link>
                <span className="text-gray-300">|</span>
                <Link to="#" className="hover:text-primary transition-colors">{t?.sitemap || "Sitemap"}</Link>
              </div>
            </div>
            
            {/* Language & Currency + Social */}
            <div className="flex items-center gap-6">
              {/* Language & Currency Selector */}
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <span>🌍</span>
                  <span>English (US)</span>
                </button>
                <span className="text-gray-300">|</span>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  <span>$</span>
                  <span>USD</span>
                </button>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-4">
                <Link to="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="Twitter">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="Facebook">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="Instagram">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </Link>
                <Link to="#" className="text-muted-foreground hover:text-primary transition-all hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-label="LinkedIn">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>{t?.weAccept || "We accept:"}</p>
            <div className="flex items-center gap-4 flex-wrap justify-center">
              <span className="px-3 py-1.5 border border-gray-300 rounded bg-white">💳 Visa</span>
              <span className="px-3 py-1.5 border border-gray-300 rounded bg-white">💳 Mastercard</span>
              <span className="px-3 py-1.5 border border-gray-300 rounded bg-white">💳 Amex</span>
              <span className="px-3 py-1.5 border border-gray-300 rounded bg-white">💰 PayPal</span>
              <span className="px-3 py-1.5 border border-gray-300 rounded bg-white">💵 Apple Pay</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;