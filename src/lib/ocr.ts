import { pipeline, env } from '@huggingface/transformers';

// Configure transformers to use CDN
env.allowLocalModels = false;
env.useBrowserCache = true;

let ocrPipeline: any = null;

/**
 * Initialize OCR pipeline
 */
async function initOCR() {
  if (!ocrPipeline) {
    console.log('Initializing OCR pipeline...');
    ocrPipeline = await pipeline(
      'image-to-text',
      'Xenova/trocr-small-printed',
      { device: 'webgpu' }
    );
    console.log('OCR pipeline initialized');
  }
  return ocrPipeline;
}

/**
 * Extract text from image using OCR
 */
export async function extractTextFromImage(imageUrl: string): Promise<string> {
  try {
    const ocr = await initOCR();
    const result = await ocr(imageUrl);
    return result[0]?.generated_text || '';
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('Failed to extract text from image');
  }
}

/**
 * Parse price from extracted text
 */
export function parsePrice(text: string): number | null {
  // Look for price patterns: €12.99, 12,99, 12.99
  const priceRegex = /€?\s*(\d+)[.,](\d{2})/;
  const match = text.match(priceRegex);
  
  if (match) {
    const euros = parseInt(match[1], 10);
    const cents = parseInt(match[2], 10);
    return euros + (cents / 100);
  }
  
  return null;
}

/**
 * Parse SKU from extracted text
 */
export function parseSKU(text: string): string | null {
  // Look for SKU patterns: SKU: 123456, #123456, Code: 123456
  const skuRegex = /(?:SKU|Code|#)?\s*:?\s*(\d{6,})/i;
  const match = text.match(skuRegex);
  
  return match ? match[1] : null;
}

export interface PriceCheckResult {
  sku: string | null;
  extractedPrice: number | null;
  expectedPrice: number | null;
  match: boolean;
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
}

/**
 * Check price label against expected price
 */
export async function checkPriceLabel(
  imageUrl: string,
  priceList: { [sku: string]: number }
): Promise<PriceCheckResult> {
  const rawText = await extractTextFromImage(imageUrl);
  const extractedPrice = parsePrice(rawText);
  const sku = parseSKU(rawText);
  
  let expectedPrice: number | null = null;
  let match = false;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (sku && priceList[sku]) {
    expectedPrice = priceList[sku];
    
    if (extractedPrice !== null) {
      // Allow 1 cent tolerance for rounding
      match = Math.abs(extractedPrice - expectedPrice) <= 0.01;
      confidence = 'high';
    } else {
      confidence = 'medium';
    }
  } else if (extractedPrice !== null) {
    confidence = 'medium';
  }

  return {
    sku,
    extractedPrice,
    expectedPrice,
    match,
    confidence,
    rawText
  };
}

/**
 * Load image from file/blob
 */
export function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
