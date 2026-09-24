"use client";

import {
  Bell,
  Menu,
  Search,
  Settings,
  LogOut,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "./ui/sidebar";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center border-b bg-background/95 backdrop-blur">
      <SidebarTrigger />
      <div className="flex w-full items-center justify-between gap-4 px-4 md:px-6">

        {/* Left */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
          >
            <Menu className="size-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="hidden md:block">
            <h1 className="text-sm font-semibold">
              Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Welcome back
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="hidden max-w-md flex-1 md:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search..."
              className="h-9 pl-9 bg-muted/40"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1">

          {/* Notifications */}
          {/* <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <Bell className="size-5" />

            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary" />

            <span className="sr-only">
              Notifications
            </span>
          </Button> */}

          {/* User */}
          {/* <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                className="h-10 gap-2 px-2"
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src="/avatar.png"
                    alt="User"
                  />
                  <AvatarFallback>
                    RS
                  </AvatarFallback>
                </Avatar>

                <div className="hidden text-left sm:block">
                  <p className="text-sm font-medium">
                    Rahim Shaikh
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Administrator
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56"
            >
              <DropdownMenuLabel>
                My Account
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem>
                <User className="mr-2 size-4" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="mr-2 size-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 size-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}

        </div>
      </div>
    </header>
  );
}