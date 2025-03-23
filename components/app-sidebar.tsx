"use client";
import * as React from "react";
import { getUserSession } from "@/app/actions/auth-actions";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useEffect } from "react";
import { toast } from "sonner";

// Default guest user data
const guestUser = {
  name: "Guest",
  email: "Guest@email.com",
  avatar: "DN",
  isLoggedIn: false,
};

// This is sample data.
interface User {
  name: string;
  email: string;
  avatar: string;
  isLoggedIn: boolean;
}

const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Bills",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: "Billing Statements",
      url: "#",
      icon: Bot,
    },
    {
      title: "History",
      url: "#",
      icon: BookOpen,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<User>(guestUser);

  useEffect(() => {
    async function loadSession() {
      const session = await getUserSession();
      if (session && session.user) {
        setUser({
          name: session.user.name ?? "Guest",
          email: session.user.email ?? "Guest@email.com",
          avatar: session.user.image ?? "DN",
          isLoggedIn: true,
        });
          toast("User Logged In Successfully"); 
      } else {
        setUser(guestUser);
      }
    }
    loadSession();
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} setUser={setUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
