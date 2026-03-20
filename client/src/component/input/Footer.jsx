import { FaInstagram, FaTwitter, FaFacebook, FaYoutube, FaHeart } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  
  // Check if current route is the dashboard/home
  const isDashboard = location.pathname === "/dashboard";
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  
  return (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/dashboard" onClick={scrollToTop} className="inline-block">
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-cyan-200 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                TravelDiary
              </h2>
            </Link>
            <p className="text-slate-300 mb-6 leading-relaxed max-w-md">
              Share your travel stories, adventures, and memorable moments with the world. 
              Connect with fellow travelers and inspire others to explore the beautiful places around us.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-cyan-500 transition-all duration-300 transform hover:scale-110"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-cyan-500 transition-all duration-300 transform hover:scale-110"
              >
                <FaTwitter className="text-lg" />
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-cyan-500 transition-all duration-300 transform hover:scale-110"
              >
                <FaFacebook className="text-lg" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:bg-cyan-500 transition-all duration-300 transform hover:scale-110"
              >
                <FaYoutube className="text-lg" />
              </a>
            </div>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Important</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard" 
                  onClick={scrollToTop}
                  className={`transition-colors duration-200 ${isDashboard ? 'text-cyan-400 font-medium' : 'text-slate-300 hover:text-cyan-400'}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/login" 
                  onClick={scrollToTop}
                  className={`transition-colors duration-200 ${location.pathname === '/login' ? 'text-cyan-400 font-medium' : 'text-slate-300 hover:text-cyan-400'}`}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link 
                  to="/signup" 
                  onClick={scrollToTop}
                  className={`transition-colors duration-200 ${location.pathname === '/signup' ? 'text-cyan-400 font-medium' : 'text-slate-300 hover:text-cyan-400'}`}
                >
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-300">
                <HiOutlineMail className="text-cyan-400 text-xl" />
                <a href="mailto:hello@traveldiary.com" className="hover:text-cyan-400 transition-colors">
                  hello@traveldiary.com
                </a>
              </li>
              <li className="text-slate-300">
                <span>Made with</span>
                <FaHeart className="inline text-red-500 mx-1" />
                <span>for travelers</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">
              © {currentYear} TravelDiary. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-400">
              <span className="cursor-not-allowed opacity-50">Privacy Policy</span>
              <span className="cursor-not-allowed opacity-50">Terms of Service</span>
              <span className="cursor-not-allowed opacity-50">Cookie Policy</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
