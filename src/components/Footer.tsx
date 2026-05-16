import React from 'react';
import { Calendar, Globe, Mail, Phone, MessageSquare } from 'lucide-react';

interface FooterProps {
  homeConfig?: any;
}

const Footer: React.FC<FooterProps> = ({ homeConfig }) => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 tracking-tight">
                {homeConfig?.campusName || 'CampusPulse'}
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {homeConfig?.footerText || 'The central hub for everything happening on campus. Discover, plan, and connect with your community.'}
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><MessageSquare className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Phone className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-indigo-600 transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-4">Explore</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">All Events</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Student Clubs</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Campus Map</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Resources</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Help Center</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Safety Guide</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Report Issue</a></li>
              <li><a href="#" className="text-gray-500 hover:text-indigo-600 text-sm transition-colors">Feedback</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 font-bold mb-4">Mobile App</h3>
            <p className="text-gray-500 text-sm mb-4">Get the full experience on your mobile device.</p>
            <div className="flex flex-col gap-2">
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                <span className="text-xs">Download on</span>
                <span className="font-bold">App Store</span>
              </button>
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors">
                <span className="text-xs">Get it on</span>
                <span className="font-bold">Google Play</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">© 2024 CampusPulse. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="text-gray-400 hover:text-indigo-600 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 text-sm">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-indigo-600 text-sm">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
