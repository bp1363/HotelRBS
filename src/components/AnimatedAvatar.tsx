import React, { useState, useEffect, useRef } from 'react';

interface AnimatedAvatarProps {
  src?: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
  isOpen?: boolean;
}

interface Position {
  x: number;
  y: number;
}

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({ 
  src, 
  alt = "Avatar", 
  className = "",
  onClick,
  isOpen = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const [hasClicked, setHasClicked] = useState(false);

  // Load saved position from localStorage, but force left positioning
  useEffect(() => {
    const savedPosition = localStorage.getItem('avatar-position');
    if (savedPosition) {
      const parsed = JSON.parse(savedPosition);
      // Only use saved position if it's on the left side (x < window.innerWidth / 2)
      if (parsed.x > 0 && parsed.x < window.innerWidth / 2) {
        setPosition(parsed);
      } else {
        // Reset to default left position
        setPosition({ x: 0, y: 0 });
        localStorage.removeItem('avatar-position');
      }
    }
  }, []);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (position.x !== 0 || position.y !== 0) {
      localStorage.setItem('avatar-position', JSON.stringify(position));
    }
  }, [position]);

  // Handle drag start
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setHasClicked(false);
    if (avatarRef.current) {
      const rect = avatarRef.current.getBoundingClientRect();
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
    }
  };

  // Handle drag move
  const handleDragMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;
      
      // Get viewport dimensions
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const elementWidth = avatarRef.current?.offsetWidth || 64;
      const elementHeight = avatarRef.current?.offsetHeight || 64;
      
      // Constrain within viewport
      const constrainedX = Math.max(0, Math.min(newX, viewportWidth - elementWidth));
      const constrainedY = Math.max(0, Math.min(newY, viewportHeight - elementHeight));
      
      console.log('Dragging to:', constrainedX, constrainedY);
      setPosition({ x: constrainedX, y: constrainedY });
    }
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (isDragging && !hasClicked) {
      // If we dragged, don't trigger onClick
      setHasClicked(false);
    } else {
      setHasClicked(true);
    }
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Mouse down on avatar');
    setHasClicked(false);
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setTimeout(() => {
      handleDragEnd();
    }, 50);
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    console.log('Touch start on avatar');
    setHasClicked(false);
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => {
      handleDragEnd();
    }, 50);
  };

  // Add/remove event listeners
  useEffect(() => {
    const handleMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const handleUp = () => handleDragEnd();
    const handleTMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTEnd = () => handleDragEnd();

    if (isDragging) {
      console.log('Adding event listeners for dragging');
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleUp);
      window.addEventListener('touchmove', handleTMove, { passive: false });
      window.addEventListener('touchend', handleTEnd);
      
      return () => {
        console.log('Removing event listeners');
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', handleUp);
        window.removeEventListener('touchmove', handleTMove);
        window.removeEventListener('touchend', handleTEnd);
      };
    }
  }, [isDragging, dragOffset]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging && hasClicked && onClick) {
      onClick();
    }
  };

  return (
    <div 
      ref={avatarRef}
      className={`animated-avatar w-14 h-14 rounded-full overflow-hidden transition-all duration-300 hover:scale-110 hover:shadow-2xl bg-primary ${isOpen ? 'ring-4 ring-primary/30 scale-110' : ''} ${className} ${isDragging ? 'opacity-80' : ''}`}
      style={{
        position: 'fixed',
        left: position.x !== 0 ? `${position.x}px` : '2rem',
        top: position.y !== 0 ? `${position.y}px` : undefined,
        bottom: position.y !== 0 ? 'auto' : (window.innerWidth <= 768 ? '5rem' : '2rem'), // Move up on mobile
        right: position.x !== 0 ? 'auto' : undefined,
        cursor: isDragging ? 'grabbing' : 'pointer',
        userSelect: 'none',
        touchAction: 'none',
        zIndex: 50,
        boxShadow: isDragging ? '0 12px 40px rgba(35, 102, 90, 0.35)' : '0 6px 20px rgba(35, 102, 90, 0.25)',
        border: '3px solid white',
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      title="Chat with us"
    >
      <img 
        src={src || "https://i.ibb.co/7bzcppC/pngwing-com-removebg-preview.png"} 
        alt={alt}
        className="w-full h-full object-cover"
        draggable={false}
        style={{ pointerEvents: 'none' }}
      />
    </div>
  );
};

export default AnimatedAvatar;