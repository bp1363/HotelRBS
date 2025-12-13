import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Tag, Heart } from 'lucide-react';

const MobileFooterNav: React.FC = () => {
  const location = useLocation();

  const navigation = [
    { 
      name: "Home", 
      href: "/", 
      icon: Home, 
      label: "Home",
      activeColor: "text-blue-600"
    },
    {
      name: "My Trips",
      href: "/profile",
      icon: Briefcase,
      label: "My Trips",
      activeColor: "text-blue-600"
    },
    { 
      name: "Deals", 
      href: "/deals", 
      icon: Tag, 
      label: "Deals",
      activeColor: "text-blue-600"
    },
    {
      name: "Saved",
      href: "/wishlist",
      icon: Heart,
      label: "Saved",
      activeColor: "text-blue-600"
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="mobile-footer-nav fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200/80 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] md:hidden backdrop-blur-sm">
      <div className="flex items-center justify-around px-1 py-2 safe-area-bottom">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 min-w-0 flex-1 group ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <div className={`flex items-center justify-center mb-1 relative ${
                active ? 'scale-110' : 'scale-100 group-hover:scale-105'
              } transition-transform duration-300`}>
                <Icon 
                  className={`w-6 h-6 transition-all duration-300 ${
                    active 
                      ? 'text-blue-600 fill-blue-600' 
                      : 'text-gray-500 group-hover:text-blue-500'
                  }`}
                />
                {active && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-all duration-300 leading-tight ${
                active 
                  ? 'text-blue-600 font-bold' 
                  : 'text-gray-500 group-hover:text-blue-500'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileFooterNav;
