import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { LogOut, Menu, CheckSquare, LayoutDashboard, Shield } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isStoreManager, isAdmin } = useUserRole(user?.id);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">{t('app.title')}</h2>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t('dashboard.title')}
          </Button>
          {isStoreManager && (
            <Button
              variant="ghost"
              onClick={() => navigate('/my-day')}
              className="gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              {t('dashboard.myDay')}
            </Button>
          )}
          {isAdmin && (
            <Button
              variant="ghost"
              onClick={() => navigate('/admin')}
              className="gap-2"
            >
              <Shield className="h-4 w-4" />
              {t('admin.title')}
            </Button>
          )}
          <LanguageSwitcher />
          <Button variant="outline" onClick={signOut} className="gap-2">
            <LogOut className="h-4 w-4" />
            {t('auth.signout')}
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <LanguageSwitcher />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <nav className="flex flex-col gap-4 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="justify-start gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {t('dashboard.title')}
                </Button>
                {isStoreManager && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/my-day')}
                    className="justify-start gap-2"
                  >
                    <CheckSquare className="h-4 w-4" />
                    {t('dashboard.myDay')}
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/admin')}
                    className="justify-start gap-2"
                  >
                    <Shield className="h-4 w-4" />
                    {t('admin.title')}
                  </Button>
                )}
                <Button variant="outline" onClick={signOut} className="justify-start gap-2">
                  <LogOut className="h-4 w-4" />
                  {t('auth.signout')}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
