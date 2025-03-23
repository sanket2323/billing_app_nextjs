"use client";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  LogOut,
  LogIn,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  signInWithGoogle,
  signOutWithGoogle,
} from "@/app/actions/auth-actions";
import { toast } from "sonner";

export function NavUser({
  user,
  setUser,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    isLoggedIn: boolean;
  };
  setUser: React.Dispatch<React.SetStateAction<typeof user>>;
}) {
  const { isMobile } = useSidebar();

  const guestUser = {
    name: "Guest",
    email: "Guest@email.com",
    avatar: "DN",
    isLoggedIn: false,
  };

  const loginGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast("Error while Logging In");
    }
  };

  const logoutGoogle = async () => {
    toast("User Logged Out Successfully");
    // First update the UI immediately
    setUser(guestUser);
    // Then perform the actual logout action
    await signOutWithGoogle();
    

  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.isLoggedIn ? user.name.charAt(0) : "G"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.isLoggedIn ? user.name.charAt(0) : "G"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {user.isLoggedIn && (
              <>
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              </>
            )}
            {user.isLoggedIn ? (
              <DropdownMenuItem onClick={logoutGoogle}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={loginGoogle}>
                <LogIn />
                Log in
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
