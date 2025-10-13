import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Camera, Loader2, CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { checkPriceLabel, loadImage } from '@/lib/ocr';
import { useTranslation } from 'react-i18next';

interface PriceCheckResult {
  sku: string | null;
  extractedPrice: number | null;
  expectedPrice: number | null;
  match: boolean;
  confidence: 'high' | 'medium' | 'low';
  rawText: string;
}

const PriceChecker = () => {
  const { t } = useTranslation();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<PriceCheckResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mock price list - in production this would come from API
  const priceList: { [sku: string]: number } = {
    '123456': 12.99,
    '789012': 5.49,
    '345678': 8.99,
    '901234': 15.99
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('errors.imageTooLarge'));
      return;
    }

    setChecking(true);
    setResult(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Load image and run OCR
      const imageElement = await loadImage(file);
      const imageUrl = URL.createObjectURL(file);

      const checkResult = await checkPriceLabel(imageUrl, priceList);
      setResult(checkResult);

      if (checkResult.match) {
        toast.success(t('success.priceVerified'));
      } else if (checkResult.sku && checkResult.expectedPrice !== null) {
        toast.error(t('warnings.priceMismatch'));
      } else {
        toast.warning(t('warnings.couldNotVerifyPrice'));
      }
    } catch (error) {
      console.error('Error checking price:', error);
      toast.error(t('errors.failedToProcessImage'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Camera className="h-8 w-8 text-primary" />
            {t('priceChecker.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('priceChecker.subtitle')}
          </p>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Price Label</CardTitle>
            <CardDescription>
              Take a photo or upload an image of a price label
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
                id="price-upload"
                disabled={checking}
              />
              <label htmlFor="price-upload">
                <div className="cursor-pointer">
                  {checking ? (
                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
                  ) : (
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    {checking ? 'Processing image...' : 'Click or tap to upload/capture image'}
                  </p>
                </div>
              </label>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="rounded-lg overflow-hidden border">
                <img 
                  src={imagePreview} 
                  alt="Price label" 
                  className="w-full max-h-96 object-contain bg-muted"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Verification Result</CardTitle>
                <Badge variant={result.match ? 'default' : 'destructive'}>
                  {result.match ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Match
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Mismatch
                    </>
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">SKU</p>
                  <p className="text-lg font-semibold">
                    {result.sku || 'Not detected'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confidence</p>
                  <Badge variant={
                    result.confidence === 'high' ? 'default' :
                    result.confidence === 'medium' ? 'secondary' :
                    'outline'
                  }>
                    {result.confidence}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Extracted Price
                  </p>
                  <p className="text-2xl font-bold">
                    {result.extractedPrice !== null ? `€${result.extractedPrice.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Expected Price
                  </p>
                  <p className="text-2xl font-bold">
                    {result.expectedPrice !== null ? `€${result.expectedPrice.toFixed(2)}` : 'N/A'}
                  </p>
                </div>
              </div>

              {!result.match && result.expectedPrice !== null && result.extractedPrice !== null && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-destructive mb-1">
                    ⚠️ Price Discrepancy Detected
                  </p>
                  <p className="text-sm text-destructive/80">
                    Difference: €{Math.abs(result.extractedPrice - result.expectedPrice).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Raw OCR Text:</p>
                <code className="text-xs bg-background p-2 rounded block">
                  {result.rawText || 'No text extracted'}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Tips for Best Results</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Ensure the label is well-lit and in focus</li>
              <li>• Capture the entire price label in the frame</li>
              <li>• Avoid glare and shadows on the label</li>
              <li>• Hold the camera steady when capturing</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PriceChecker;
