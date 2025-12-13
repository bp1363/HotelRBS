import { useEffect, useRef } from "react";

// TypeScript declaration for chatbot global objects
declare global {
  interface Window {
    n8nChatbot?: {
      open: () => void;
      close: () => void;
    };
  }
}


const ChatBot = () => {
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Load the n8n chatbot script when component mounts
    const loadN8nChatbot = () => {
      if (scriptRef.current) return; // Already loaded

      // Calculate dimensions based on current window size
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      const isSmallMobile = typeof window !== 'undefined' && window.innerWidth <= 480;
      const chatHeight = isMobile ? 420 : 480;
      const chatWidth = isMobile ? (isSmallMobile ? 300 : 320) : 360;
      const buttonBottom = isMobile ? 80 : 20; // Move button up on mobile

      const script = document.createElement('script');
      script.type = 'module';
      script.defer = true;
      script.innerHTML = `
        import Chatbot from "https://cdn.n8nchatui.com/v1/embed.js";
        const chatbot = Chatbot.init({
          "n8nChatUrl": "https://n8n.srv982383.hstgr.cloud/webhook/27dc8f3f-135a-46ed-9a6f-149c8b9eb778/chat",
          "metadata": {},
          "theme": {
            "button": {
              "backgroundColor": "#23665a",
              "left": 20,
              "bottom": ${buttonBottom},
              "size": 80,
              "iconColor": "#f5f4ef",
              "customIconSrc": "https://i.ibb.co/7bzcppC/pngwing-com-removebg-preview.png",
              "customIconSize": 95,
              "customIconBorderRadius": 0,
              "autoWindowOpen": {
                "autoOpen": false,
                "openDelay": 2
              },
              "borderRadius": "circle"
            },
            "tooltip": {
              "showTooltip": false,
              "tooltipMessage": "Hi There 👋",
              "tooltipBackgroundColor": "#a9ccc7",
              "tooltipTextColor": "#1c1c1c",
              "tooltipFontSize": 15,
              "tooltipPosition": "right"
            },
            "chatWindow": {
              "borderRadiusStyle": "rounded",
              "avatarBorderRadius": 30,
              "messageBorderRadius": 8,
              "showTitle": true,
              "title": "HotelRBS AI Assistance",
              "titleAvatarSrc": "https://www.svgrepo.com/show/339963/chat-bot.svg",
              "avatarSize": 30,
              "welcomeMessage": "Welcome to HotelRBS! 😊",
              "errorMessage": "Please connect to the HotelRBS Team",
              "backgroundColor": "#ffffff",
              "height": ${chatHeight},
              "width": ${chatWidth},
              "fontSize": 16,
              "starterPrompts": [
                "What kind of hotels can use HotelRBS?",
                "What are the key features of the online booking ?"
              ],
              "starterPromptFontSize": 15,
              "renderHTML": false,
              "clearChatOnReload": false,
              "showScrollbar": false,
              "botMessage": {
                "backgroundColor": "#178070",
                "textColor": "#fafafa",
                "showAvatar": true,
                "avatarSrc": "https://www.svgrepo.com/show/334455/bot.svg",
                "showCopyToClipboardIcon": false
              },
              "userMessage": {
                "backgroundColor": "#efeeeb",
                "textColor": "#050505",
                "showAvatar": true,
                "avatarSrc": "https://i.ibb.co/7bzcppC/pngwing-com-removebg-preview.png"
              },
              "textInput": {
                "placeholder": "Type your query",
                "backgroundColor": "#ffffff",
                "textColor": "#1e1e1f",
                "sendButtonColor": "#23665a",
                "maxChars": 200,
                "maxCharsWarningMessage": "You exceeded the characters limit. Please input less than 200 characters.",
                "autoFocus": false,
                "borderRadius": 2,
                "sendButtonBorderRadius": 50
              }
            }
          }
        });
        
        // Store chatbot instance globally
        window.n8nChatbot = chatbot;
        
        // Force n8n chat window to appear on left after initialization
        var forceLeftPosition = function() {
          try {
            // First, try to find iframes directly (more efficient)
            var iframes = document.querySelectorAll('iframe[src*="n8n"]');
            for (var j = 0; j < iframes.length; j++) {
              try {
                var iframe = iframes[j];
                var parent = iframe.parentElement;
                while (parent && parent !== document.body) {
                  if (parent.style && parent.style.position === 'fixed') {
                    var width = parseInt(parent.style.width) || 0;
                    if (width >= 300 && width <= 450) {
                      parent.style.setProperty('left', '20px', 'important');
                      parent.style.setProperty('right', 'auto', 'important');
                      parent.style.setProperty('bottom', '100px', 'important');
                    }
                  }
                  parent = parent.parentElement;
                }
              } catch (e) {
                // Skip this iframe if there's an error
                continue;
              }
            }
            
            // Also check elements with n8n in id or class (more targeted search)
            var n8nElements = document.querySelectorAll('[id*="n8n"], [class*="n8n"]');
            for (var i = 0; i < n8nElements.length; i++) {
              try {
                var element = n8nElements[i];
                if (!element || !element.style) continue;
                
                var style = element.style || {};
                if (style.position === 'fixed') {
                  var width = parseInt(style.width) || 0;
                  if (width >= 300 && width <= 450) {
                    element.style.setProperty('left', '20px', 'important');
                    element.style.setProperty('right', 'auto', 'important');
                    element.style.setProperty('bottom', '100px', 'important');
                  }
                }
              } catch (e) {
                // Skip this element if there's an error
                continue;
              }
            }
          } catch (e) {
            // Silently fail if there's a major error
            console.error('Error in forceLeftPosition:', e);
          }
        };
        
        // Run immediately and set up observer
        setTimeout(forceLeftPosition, 500);
        setTimeout(forceLeftPosition, 1500);
        setTimeout(forceLeftPosition, 3000);
        
        var observer = new MutationObserver(function() {
          forceLeftPosition();
        });
        
        observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style'] });
      `;
      
      document.head.appendChild(script);
      scriptRef.current = script;
    };

    loadN8nChatbot();

    // Cleanup function - Don't remove scripts as they register custom elements
    // that can't be re-registered
    return () => {
      if (scriptRef.current && scriptRef.current.parentNode) {
        try {
          document.head.removeChild(scriptRef.current);
          scriptRef.current = null;
        } catch (e) {
          console.log('Script already removed');
        }
      }
    };
  }, []);

  return null;
};

export default ChatBot;