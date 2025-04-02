"use client"
import * as React from "react"
import { ChevronsUpDown, Pencil, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"

export function CompanySwitcher({
  companyDetails,
  hasCompanyDetails = false,
}: {
  companyDetails: {
    companyName: string;
    state: string;
    logo?: React.ElementType;
  },
  hasCompanyDetails?: boolean;
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  
  // Default logo if not provided
  const DefaultLogo = companyDetails.logo || (() => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="size-4"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ))

  const handleCompanyAction = () => {
    // Navigate to the company_details route instead of edit-company-details
    router.push("/company_details")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <DefaultLogo />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{companyDetails.companyName || "Your Company"}</span>
                <span className="truncate text-xs">{companyDetails.state || "Location"}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Company Settings
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="gap-2 p-2 cursor-pointer"
              onClick={handleCompanyAction}
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                {hasCompanyDetails ? (
                  <Pencil className="size-3.5 shrink-0" />
                ) : (
                  <Plus className="size-3.5 shrink-0" />
                )}
              </div>
              <div className="font-medium">
                {hasCompanyDetails ? "Edit Company Details" : "Add Company Details"}
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}