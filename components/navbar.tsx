"use client";

import { Button } from "@/components/ui/button";
import { Heart, Menu, LogOut, User, Settings, CreditCard } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { User as AuthUser } from "next-auth";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "./notifications/notification-bell";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as AuthUser;

  const handleSignOut = async () => {
    try {
      const result = await signOut();
      if (result) {
        router.replace('/');
      }
    } catch (error) {
      console.log("Error while Sign-out", error);
    }
  };

  // Helper to determine if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  const NavLinks = () => (
    <>
      <Link 
        href="/compatibility" 
        className={`transition-colors ${
          isActive('/compatibility') 
            ? "text-primary font-medium" 
            : "text-foreground/60 hover:text-foreground"
        }`}
      >
        Compatibility
      </Link>
      <Link 
        href="/Q&A" 
        className={`transition-colors ${
          isActive('/Q&A') 
            ? "text-primary font-medium" 
            : "text-foreground/60 hover:text-foreground"
        }`}
      >
        Q&A
      </Link>
      <Link 
        href="/ai-counseling" 
        className={`transition-colors ${
          isActive('/ai-counseling') 
            ? "text-primary font-medium" 
            : "text-foreground/60 hover:text-foreground"
        }`}
      >
        AI-Counseling
      </Link>
    </>
  );

  return (
    <nav className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link 
            href="/" 
            className="flex items-center space-x-2"
          >
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">LoveBite.ai</span>
          </Link>

          {/* Desktop Navigation */}
         { session &&   <div className="hidden md:flex items-center space-x-6">
            <NavLinks />
          </div>}

          <div className="flex items-center space-x-4">
            {session && <NotificationBell />}
            {/* User Menu */}
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ""} alt={user.name || ""} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <Link href='/profile'>
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span onClick={() => router.push('/pricing')}>Credits</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 focus:bg-red-100"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/sign-in">
                <Button>Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
          {  session && <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="top" className="h-[40vh]">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      LoveBite.ai Menu
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col space-y-4 mt-8">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>
            </div>}
          </div>
        </div>
      </div>
    </nav>
  );
}