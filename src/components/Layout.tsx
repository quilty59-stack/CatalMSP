import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  headerTitle?: string;
  showBack?: boolean;
  backTo?: string;
  hideNav?: boolean;
}

export function Layout({ 
  children, 
  headerTitle, 
  showBack = false, 
  backTo = '/',
  hideNav = false 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header title={headerTitle} showBack={showBack} backTo={backTo} />
      <main className={hideNav ? 'pb-4' : 'pb-24'}>
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
