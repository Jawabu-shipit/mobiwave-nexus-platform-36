import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
}

/**
 * SEO component for managing meta tags
 * 
 * This component dynamically updates meta tags for SEO optimization
 * based on the current page and provided props.
 */
export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  ogImage = '/public/mobiwave-og-image.jpg',
  ogType = 'website',
  twitterCard = 'summary_large_image',
  canonicalUrl,
  noIndex = false,
  structuredData,
}) => {
  const location = useLocation();
  const baseUrl = 'https://mobiwave.io';
  const currentUrl = `${baseUrl}${location.pathname}`;
  
  // Default values
  const defaultTitle = 'Mobiwave Nexus Platform | Mobile Communication Solutions';
  const defaultDescription = 'Comprehensive mobile communication solutions including SMS, WhatsApp, USSD, and M-Pesa integrations for businesses in Africa.';
  const defaultKeywords = 'mobile communication, SMS platform, WhatsApp business, USSD services, M-Pesa integration, bulk messaging, mobile payments, Africa tech';
  
  // Final values to use
  const finalTitle = title ? `${title} | Mobiwave` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalCanonicalUrl = canonicalUrl || currentUrl;

  useEffect(() => {
    // Update document title
    document.title = finalTitle;
    
    // Update meta tags
    const metaTags = {
      description: finalDescription,
      keywords: finalKeywords,
      'og:title': finalTitle,
      'og:description': finalDescription,
      'og:url': finalCanonicalUrl,
      'og:image': ogImage,
      'og:type': ogType,
      'twitter:card': twitterCard,
      'twitter:title': finalTitle,
      'twitter:description': finalDescription,
      'twitter:url': finalCanonicalUrl,
      'twitter:image': ogImage,
    };
    
    // Update or create meta tags
    Object.entries(metaTags).forEach(([name, content]) => {
      // Handle Open Graph tags
      if (name.startsWith('og:')) {
        let element = document.querySelector(`meta[property="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      } 
      // Handle Twitter tags
      else if (name.startsWith('twitter:')) {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      } 
      // Handle regular meta tags
      else {
        let element = document.querySelector(`meta[name="${name}"]`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('name', name);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      }
    });
    
    // Handle robots meta tag
    let robotsTag = document.querySelector('meta[name="robots"]');
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.setAttribute('name', 'robots');
      document.head.appendChild(robotsTag);
    }
    robotsTag.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');
    
    // Handle canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', finalCanonicalUrl);
    
    // Handle structured data
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }
    
    // Cleanup function
    return () => {
      // We don't remove the tags on cleanup as they should be updated by the next page
    };
  }, [
    finalTitle, 
    finalDescription, 
    finalKeywords, 
    finalCanonicalUrl, 
    ogImage, 
    ogType, 
    twitterCard, 
    noIndex, 
    structuredData
  ]);

  // This component doesn't render anything visible
  return null;
};

export default SEO;