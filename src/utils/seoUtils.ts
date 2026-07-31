export function updatePageMeta(title: string, description: string, imageUrl?: string, url?: string) {
  // Update document title
  document.title = title;

  const setMeta = (selector: string, attrName: string, attrVal: string, content: string) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attrName, attrVal);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // Open Graph metadata for social media sharing
  setMeta('meta[property="og:title"]', 'property', 'og:title', title);
  if (description) {
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
  }
  if (imageUrl) {
    let fullImg = imageUrl;
    if (!imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('/')) {
        fullImg = `${window.location.origin}${imageUrl}`;
      } else {
        fullImg = `https://lh3.googleusercontent.com/d/${imageUrl}=s1200`;
      }
    }
    setMeta('meta[property="og:image"]', 'property', 'og:image', fullImg);
  }
  if (url || window.location.href) {
    setMeta('meta[property="og:url"]', 'property', 'og:url', url || window.location.href);
  }

  // Twitter Card metadata
  setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
  if (description) {
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  }
  if (imageUrl) {
    let fullImg = imageUrl;
    if (!imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('/')) {
        fullImg = `${window.location.origin}${imageUrl}`;
      } else {
        fullImg = `https://lh3.googleusercontent.com/d/${imageUrl}=s1200`;
      }
    }
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', fullImg);
  }
}
