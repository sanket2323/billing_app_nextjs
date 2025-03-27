"use client"; // Ensures this is a Client Component
import React from 'react';
import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const router = useRouter();
  const { setOpen } = useSidebar();
  const handleNavigation = (url: string) => {
    router.push(url); // Client-side navigation, no refresh
    setOpen(false)
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-lg font-medium">
        Automate Bills
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              onClick={() => handleNavigation(item.url)} // Use handler function
              asChild // Optional: ensures proper rendering if wrapped
            >
              <div className="flex items-center">
                {item.icon && <item.icon className="h-6 w-6 mr-3" />}
                <span className="font-medium text-lg">{item.title}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}