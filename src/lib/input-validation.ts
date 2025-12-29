/**
 * Input Validation Utilities
 * Provides security-focused validation functions to prevent:
 * - SSRF (Server-Side Request Forgery) attacks
 * - XSS (Cross-Site Scripting) via control characters
 * - DoS (Denial of Service) via oversized inputs
 */

/**
 * Validates URLs to prevent SSRF attacks
 * Blocks:
 * - localhost and 127.0.0.1
 * - Private IP ranges (10.x, 172.16-31.x, 192.168.x)
 * - Non-HTTP/HTTPS protocols
 * - IPv6 localhost (::1)
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return {
        valid: false,
        error: `Invalid protocol: ${parsedUrl.protocol}. Only http: and https: are allowed.`
      };
    }
    
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return {
        valid: false,
        error: 'Localhost URLs are not allowed for security reasons.'
      };
    }
    
    // Block private IP ranges
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = hostname.match(ipv4Regex);
    
    if (ipv4Match) {
      const [, oct1, oct2, oct3, oct4] = ipv4Match.map(Number);
      
      // Validate octets are in valid range
      if (oct1 > 255 || oct2 > 255 || oct3 > 255 || oct4 > 255) {
        return {
          valid: false,
          error: 'Invalid IP address format.'
        };
      }
      
      // Block 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
      if (oct1 === 10) {
        return {
          valid: false,
          error: 'Private IP range (10.x.x.x) is not allowed.'
        };
      }
      
      // Block 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
      if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) {
        return {
          valid: false,
          error: 'Private IP range (172.16-31.x.x) is not allowed.'
        };
      }
      
      // Block 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
      if (oct1 === 192 && oct2 === 168) {
        return {
          valid: false,
          error: 'Private IP range (192.168.x.x) is not allowed.'
        };
      }
      
      // Block 169.254.0.0/16 (link-local)
      if (oct1 === 169 && oct2 === 254) {
        return {
          valid: false,
          error: 'Link-local IP range (169.254.x.x) is not allowed.'
        };
      }
      
      // Block loopback range 127.0.0.0/8
      if (oct1 === 127) {
        return {
          valid: false,
          error: 'Loopback IP range (127.x.x.x) is not allowed.'
        };
      }
    }
    
    // Block IPv6 private ranges
    if (hostname.includes(':')) {
      // Block IPv6 localhost
      if (hostname === '::1' || hostname === '0:0:0:0:0:0:0:1') {
        return {
          valid: false,
          error: 'IPv6 localhost is not allowed.'
        };
      }
      
      // Block IPv6 link-local (fe80::/10)
      if (hostname.startsWith('fe80:')) {
        return {
          valid: false,
          error: 'IPv6 link-local addresses are not allowed.'
        };
      }
      
      // Block IPv6 unique local (fc00::/7)
      if (hostname.startsWith('fc') || hostname.startsWith('fd')) {
        return {
          valid: false,
          error: 'IPv6 unique local addresses are not allowed.'
        };
      }
    }
    
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid URL format'
    };
  }
}

/**
 * Sanitizes text by removing control characters and trimming
 * Also limits length to prevent DoS attacks
 */
export function sanitizeText(
  text: string,
  options: {
    maxLength?: number;
    removeControlChars?: boolean;
    trim?: boolean;
  } = {}
): string {
  const {
    maxLength = 100000,
    removeControlChars = true,
    trim = true
  } = options;
  
  let sanitized = text;
  
  // Remove control characters (0x00-0x1F except \n, \r, \t)
  if (removeControlChars) {
    // eslint-disable-next-line no-control-regex
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  }
  
  // Trim whitespace
  if (trim) {
    sanitized = sanitized.trim();
  }
  
  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  
  return sanitized;
}

/**
 * Validates input for embedding generation
 * Checks:
 * - Length constraints (max 8000 chars for most embedding models)
 * - Non-empty content
 * - No excessive control characters
 */
export function validateEmbeddingInput(
  text: string,
  options: {
    maxLength?: number;
    minLength?: number;
  } = {}
): { valid: boolean; error?: string; sanitized?: string } {
  const {
    maxLength = 8000,
    minLength = 1
  } = options;
  
  // Sanitize first
  const sanitized = sanitizeText(text, { maxLength, removeControlChars: true, trim: true });
  
  // Check if empty after sanitization
  if (sanitized.length === 0) {
    return {
      valid: false,
      error: 'Input text is empty or contains only whitespace/control characters.'
    };
  }
  
  // Check minimum length
  if (sanitized.length < minLength) {
    return {
      valid: false,
      error: `Input text is too short. Minimum length is ${minLength} characters.`
    };
  }
  
  // Check maximum length
  if (sanitized.length > maxLength) {
    return {
      valid: false,
      error: `Input text is too long. Maximum length is ${maxLength} characters.`,
      sanitized
    };
  }
  
  return {
    valid: true,
    sanitized
  };
}

/**
 * Validates a batch of texts for embedding
 */
export function validateEmbeddingBatch(
  texts: string[],
  options: {
    maxBatchSize?: number;
    maxLength?: number;
  } = {}
): { valid: boolean; error?: string; validTexts?: string[] } {
  const {
    maxBatchSize = 100,
    maxLength = 8000
  } = options;
  
  if (!Array.isArray(texts)) {
    return {
      valid: false,
      error: 'Input must be an array of strings.'
    };
  }
  
  if (texts.length === 0) {
    return {
      valid: false,
      error: 'Input array is empty.'
    };
  }
  
  if (texts.length > maxBatchSize) {
    return {
      valid: false,
      error: `Batch size exceeds maximum of ${maxBatchSize} items.`
    };
  }
  
  const validTexts: string[] = [];
  
  for (let i = 0; i < texts.length; i++) {
    const result = validateEmbeddingInput(texts[i], { maxLength });
    if (!result.valid) {
      return {
        valid: false,
        error: `Item at index ${i}: ${result.error}`
      };
    }
    validTexts.push(result.sanitized!);
  }
  
  return {
    valid: true,
    validTexts
  };
}
