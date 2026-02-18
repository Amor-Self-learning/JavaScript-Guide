# 20.1 Sharing Content

The Web Share API allows web pages to invoke the native share dialog, enabling users to share content to other apps and services.

---

## 20.1.1 Basic Usage

### Share URL

```javascript
async function shareURL(url, title, text) {
  if (!navigator.share) {
    console.log('Web Share not supported');
    return false;
  }
  
  try {
    await navigator.share({
      title,
      text,
      url
    });
    console.log('Shared successfully');
    return true;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Share cancelled');
    } else {
      console.error('Share failed:', error);
    }
    return false;
  }
}

// Usage
await shareURL(
  'https://example.com/article',
  'Great Article',
  'Check out this article!'
);
```

---

## 20.1.2 Check Support

### Feature Detection

```javascript
function canShare() {
  return 'share' in navigator;
}

// Check with data validation
function canShareData(data) {
  if (!navigator.canShare) {
    return 'share' in navigator;
  }
  return navigator.canShare(data);
}

// Usage
const shareData = { title: 'Test', url: 'https://example.com' };

if (canShareData(shareData)) {
  navigator.share(shareData);
} else {
  showFallbackShare();
}
```

---

## 20.1.3 Share Data Options

### Available Properties

```javascript
const shareData = {
  // Page title
  title: 'My Page Title',
  
  // Description text
  text: 'Check out this awesome content!',
  
  // URL to share
  url: 'https://example.com/page',
  
  // Files to share (optional)
  files: [file1, file2]
};

await navigator.share(shareData);
```

### Minimal Share

```javascript
// URL only
await navigator.share({ url: location.href });

// Text only
await navigator.share({ text: 'Hello World!' });
```

---

## 20.1.4 Share Files

### Check File Sharing Support

```javascript
function canShareFiles(files) {
  if (!navigator.canShare) return false;
  return navigator.canShare({ files });
}
```

### Share Images

```javascript
async function shareImage(imageBlob, filename) {
  const file = new File([imageBlob], filename, { type: imageBlob.type });
  
  if (!navigator.canShare?.({ files: [file] })) {
    console.log('File sharing not supported');
    return false;
  }
  
  try {
    await navigator.share({
      title: 'Shared Image',
      files: [file]
    });
    return true;
  } catch (error) {
    console.error('Share failed:', error);
    return false;
  }
}
```

### Share Multiple Files

```javascript
async function shareFiles(files, title = 'Shared Files') {
  if (!navigator.canShare?.({ files })) {
    throw new Error('Cannot share these files');
  }
  
  await navigator.share({
    title,
    files
  });
}

// Usage
const fileInput = document.getElementById('files');
const files = Array.from(fileInput.files);
await shareFiles(files);
```

### Share Canvas

```javascript
async function shareCanvas(canvas, title) {
  const blob = await new Promise(resolve => 
    canvas.toBlob(resolve, 'image/png')
  );
  
  const file = new File([blob], 'image.png', { type: 'image/png' });
  
  await navigator.share({
    title,
    files: [file]
  });
}
```

---

## 20.1.5 Share Button Component

### Reusable Share Button

```javascript
class ShareButton {
  constructor(element, defaultData = {}) {
    this.element = element;
    this.defaultData = defaultData;
    this.supported = 'share' in navigator;
    
    this.init();
  }
  
  init() {
    if (!this.supported) {
      this.element.style.display = 'none';
      return;
    }
    
    this.element.addEventListener('click', () => this.share());
  }
  
  async share(data = {}) {
    const shareData = { ...this.defaultData, ...data };
    
    try {
      await navigator.share(shareData);
      this.onShare?.(shareData);
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.onError?.(error);
      }
    }
  }
}

// Usage
const shareBtn = new ShareButton(
  document.getElementById('share'),
  {
    title: document.title,
    url: location.href
  }
);

shareBtn.onShare = (data) => console.log('Shared:', data);
```

---

## 20.1.6 Fallback Strategies

### Clipboard Fallback

```javascript
async function shareWithFallback(data) {
  if (navigator.share) {
    try {
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
      return 'cancelled';
    }
  }
  
  // Fallback: copy to clipboard
  const text = data.url || data.text || '';
  await navigator.clipboard.writeText(text);
  return 'copied';
}
```

### Social Links Fallback

```javascript
function getSocialShareLinks(url, title) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  return {
    twitter: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encoded}&title=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encoded}`
  };
}

function showFallbackShare(url, title) {
  const links = getSocialShareLinks(url, title);
  // Display links in a modal
  showShareModal(links);
}
```

---

## 20.1.7 Share Target API

### Receive Shares (PWA)

```json
// manifest.json
{
  "name": "My App",
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "media",
          "accept": ["image/*", "video/*"]
        }
      ]
    }
  }
}
```

### Handle Shared Data

```javascript
// Service Worker
self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('/share') && 
      event.request.method === 'POST') {
    event.respondWith(handleShare(event.request));
  }
});

async function handleShare(request) {
  const formData = await request.formData();
  
  const title = formData.get('title');
  const text = formData.get('text');
  const url = formData.get('url');
  const files = formData.getAll('media');
  
  // Store or process shared data
  // Redirect to app
  return Response.redirect('/shared?success=true', 303);
}
```

---

## 20.1.8 Summary

### Method

```javascript
navigator.share(data)
// Returns: Promise<void>
```

### Share Data Properties

| Property | Type | Description |
|----------|------|-------------|
| `title` | String | Share title |
| `text` | String | Share text/description |
| `url` | String | URL to share |
| `files` | File[] | Files to share |

### Related Methods

| Method | Description |
|--------|-------------|
| `navigator.share(data)` | Invoke share dialog |
| `navigator.canShare(data)` | Check if data is shareable |

### Browser Support

| Feature | Chrome | Firefox | Safari |
|---------|--------|---------|--------|
| Basic share | ✅ | ✅ (Android) | ✅ |
| File sharing | ✅ | ❌ | ✅ |
| Share Target | ✅ | ❌ | ✅ |

### Best Practices

1. **Check support** before showing share button
2. **Validate with canShare** before calling share
3. **Handle AbortError** when user cancels
4. **Provide fallback** for unsupported browsers
5. **Keep share data minimal** and relevant
6. **Use Share Target** to receive shares in PWAs

---

**End of Chapter 20.1: Sharing Content**

This completes Group 20 — Web Share API. Next section: **Group 21 — Contact Picker API**.
