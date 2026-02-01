import { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopHeader } from './DesktopHeader';

interface ResponsiveLayoutProps {
  children: ReactNode;
  headerTitle?: string;
  showBack?: boolean;
  backTo?: string;
  hideNav?: boolean;
  showDesktopSearch?: boolean;
}

export function ResponsiveLayout({ 
  children, 
  headerTitle, 
  showBack = false, 
  backTo = '/',
  hideNav = false,
  showDesktopSearch = true
}: ResponsiveLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Layout */}
      <DesktopSidebar />
      
      {/* Desktop Main Area */}
      <div className="lg:ml-64">
        <DesktopHeader 
          title={headerTitle} 
          showBack={showBack} 
          backTo={backTo}
          showSearch={showDesktopSearch}
        />
        
        {/* Mobile Header */}
        <div className="lg:hidden">
          <Header title={headerTitle} showBack={showBack} backTo={backTo} />
        </div>
        
        {/* Main Content */}
        <main className={hideNav ? 'pb-4' : 'pb-24 lg:pb-8'}>
          {children}
        </main>
        
        {/* Mobile Bottom Nav */}
        {!hideNav && (
          <div className="lg:hidden">
            <BottomNav />
          </div>
        )}
      </div>
    </div>
  );
}
