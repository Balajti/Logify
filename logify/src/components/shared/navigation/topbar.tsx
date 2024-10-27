'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { NotificationsDropdown } from '@/components/notifications/notifications-dropdown';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ConfirmLogoutDialog } from '@/components/dialog/confirm-logout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Topbar() {
  const { data: session } = useSession();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    <header className="h-16 border-b bg-background">
      <div className="flex h-full items-center justify-between px-6">
        <div className="text-xl font-bold">Logify</div>
        <div className="flex items-center gap-4">
          {/* <ThemeToggle /> */}
          <NotificationsDropdown />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image ?? ''} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) ?? 'U'}
                  </AvatarFallback>
                </Avatar>
                <span>{session?.user?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLogoutDialog(true)}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ConfirmLogoutDialog 
        open={showLogoutDialog} 
        onClose={() => setShowLogoutDialog(false)} 
      />
    </header>
  );
}