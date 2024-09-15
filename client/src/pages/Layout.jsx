import { Outlet, NavLink, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";
import { ModeToggle } from "../components/toggle/mode-toggle";
import { LangToggle } from "../components/toggle/lang-toggle";
import { Toaster } from "../components/ui/toaster";
import { Button } from "../components/ui/button";

import { CircleUser } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";

import { Home, Package } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import HamburgerMenu from "../components/icons/HamburgerMenu";
import { useTranslation } from "react-i18next";
import Logo from "../components/icons/Logo";
const Layout = () => {
  const { state } = useContext(AuthContext);
  const { t } = useTranslation("global");

  return (
    <div className="flex min-h-screen w-full flex-col  ">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        {state.isAuthenticated && (
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-1">
            <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
              <TooltipProvider>
                <nav className="flex flex-col items-center gap-4 px-2 py-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to="/"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                      >
                        <Home className="h-5 w-5" />
                        <span className="sr-only">{t("layout.dashboard")}</span>
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t("layout.dashboard")}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to="/equbes"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                      >
                        <Package className="h-5 w-5" />
                        <span className="sr-only">{t("layout.equbs")}</span>
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {t("layout.equbs")}
                    </TooltipContent>
                  </Tooltip>
                </nav>
                {/* <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavLink
                        to="#"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                      >
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Settings</span>
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                  </Tooltip>
                </nav> */}
              </TooltipProvider>
            </aside>
            <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <HamburgerMenu />
                  <span className="sr-only">Toggle Menu</span>
                </Button>

              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <SheetHeader>
                  <SheetTitle></SheetTitle>
                  <SheetDescription></SheetDescription>
                </SheetHeader>
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    to="/"
                    className="flex items-center gap-2 text-lg font-semibold md:text-base"
                  >
                    <Logo className="h-6 w-6" />
                    <span className="sr-only">{t("layout.logoName")}</span>
                  </Link>
                  <SheetClose asChild>
                    <NavLink
                      to="/"
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground rounded-sm"
                    >
                      <Home className="h-5 w-5" />
                      {t("layout.dashboard")}
                    </NavLink>
                  </SheetClose>

                  <SheetClose asChild>
                    <NavLink
                      to="/equbes"
                      className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground rounded-sm"
                    >
                      <Package className="h-5 w-5" />
                      {t("layout.equbs")}
                    </NavLink>
                  </SheetClose>

                </nav>
              </SheetContent>
            </Sheet>
            <Logo />
            </div>

            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
              >
                <span className="sr-only">{t("layout.logoName")}</span>
              </Link>
              <div className="ml-auto flex-1 sm:flex-initial"></div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="rounded-full"
                  >
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{t("layout.myAccount")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/settings" className="w-full">
                      <p>{t("layout.setting")}</p>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/support" className="w-full">
                      <p>{t("layout.support")}</p>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link to="/signout" className="w-full">
                      <p>{t("layout.logout")}</p>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <ModeToggle />
              <LangToggle />
            </div>
          </header>
        )}
        <Outlet />
      </div>
      {state.isAuthenticated && (
        <footer>
          <div className="w-full mx-auto max-w-screen-xl p-4 flex items-center justify-center">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © 2024{" "}
              <a href="#" className="hover:underline">
                Equb™
              </a>
              . All Rights Reserved.
            </span>
          </div>
        </footer>
      )}
      <Toaster />
    </div>
  );
};

export default Layout;
