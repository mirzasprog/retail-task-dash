import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { useTranslation } from 'react-i18next';

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const { t } = useTranslation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error(t('errors.passwordsDoNotMatch'));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t('errors.passwordTooShort'));
      return;
    }

    setIsLoading(true);
    try {
      await updatePassword(newPassword);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-width-md space-y-8">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold">{t('resetPassword.title')}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('resetPassword.setNewPassword')}</CardTitle>
            <CardDescription>
              {t('resetPassword.enterNewPassword')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t('resetPassword.newPassword')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder={t('resetPassword.confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('resetPassword.updating') : t('resetPassword.updatePassword')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
