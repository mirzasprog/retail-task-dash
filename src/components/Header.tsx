import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LogOut } from "lucide-react";

export const Header = () => {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();

  if (!user) return null;

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">{user.email}</h2>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" />
            {t('auth.signout')}
          </Button>
        </div>
      </div>
    </header>
  );
};
