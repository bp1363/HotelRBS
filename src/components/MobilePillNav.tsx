import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Tag } from 'lucide-react';
import homeIcon from '@/assets/home-icon.png';
import destinationIcon from '@/assets/destination-icon.png';
import dealsIcon from '@/assets/deals-icon.png';

const MobilePillNav: React.FC = () => {
  const location = useLocation();
  
  console.log('MobilePillNav rendering');

  const navigation = [
    { 
      name: "Hotels", 
      href: "/", 
      icon: Home, 
      customIcon: homeIcon,
      label: "Hotels"
    },
    {
      name: "Destinations",
      href: "/destinations",
      icon: MapPin,
      customIcon: destinationIcon,
      label: "Destinations"
    },
    { 
      name: "Deals", 
      href: "/deals", 
      icon: Tag, 
      customIcon: dealsIcon,
      label: "Deals"
    },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div 
      className="mobile-pill-nav"
      style={{
        position: 'fixed',
        top: 'calc(var(--header-height-default) + 0.5rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        margin: '0',
        paddingTop: '0',
        paddingBottom: '0.75rem',
        width: 'fit-content',
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      <div 
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: '9999px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgb(229, 231, 235)',
          padding: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
        }}
      >
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
              isActive(item.href)
                ? 'text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            style={
              isActive(item.href)
                ? {
                    backgroundColor: '#165d31',
                  }
                : {}
            }
          >
            <img
              src={item.customIcon}
              alt={item.name}
              className={`w-4 h-4 transition-all duration-200 ${
                isActive(item.href) ? 'brightness-0 invert' : ''
              }`}
            />
            <span className="text-sm font-medium whitespace-nowrap">
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobilePillNav;

