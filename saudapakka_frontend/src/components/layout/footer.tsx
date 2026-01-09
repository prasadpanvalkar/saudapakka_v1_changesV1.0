import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-green text-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* 1. Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Sauda<span className="text-accent-green">pakka.com</span>
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Your trusted partner for 100% verified premium real estate listings. Experience transparency like never before.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-green transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-green transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-green transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-accent-green uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-3 text-gray-300">
              <li><Link href="/search?type=BUY" className="hover:text-accent-green transition-colors">Buy Property</Link></li>
              <li><Link href="/search?type=SELL" className="hover:text-accent-green transition-colors">Sell Property</Link></li>
              <li><Link href="/search?type=RENT" className="hover:text-accent-green transition-colors">Rent Property</Link></li>
              <li><Link href="/dashboard/overview" className="hover:text-accent-green transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          {/* 3. Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-accent-green uppercase tracking-wider text-sm">Resources</h4>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-accent-green transition-colors">Area Score</a></li>
              <li><a href="#" className="hover:text-accent-green transition-colors">Loan Calculator</a></li>
              <li><a href="#" className="hover:text-accent-green transition-colors">Legal Services</a></li>
              <li><a href="#" className="hover:text-accent-green transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* 4. Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-accent-green uppercase tracking-wider text-sm">Contact Us</h4>
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent-green" />
                <span>+91 80555 44644</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent-green" />
                <span>sampark@saudapakka.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent-green mt-1" />
                <span>Chhatrapati Sambhajinagar, Maharashtra,<br />India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <p>© 2025 SaudaPakka. All rights reserved.</p>
            <span className="hidden md:block text-gray-600">|</span>
            <a
              href="https://zaikron.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-green transition-colors"
            >
              Designed & Developed by Zaikron
            </a>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}