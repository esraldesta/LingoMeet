import { Outlet, Link } from "react-router-dom";
import { ModeToggle } from "../components/toggle/mode-toggle";
import { Toaster } from "../components/ui/toaster";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CreateGroup } from "../components/dialogs/CreateGroup";
import SearchGroup from "../components/SearchGroup";

const Layout = () => {
  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="flex flex-col sm:gap-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 mb-1">
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <div className="w-[40px] h-[40px] rounded-full overflow-hidden">
              <Link
                to="/"
                className="flex items-center gap-2 text-lg font-semibold md:text-base"
              >
                <img src="/icons/android/android-launchericon-48-48.png" />
              </Link>
            </div>
            <div className="ml-auto flex-1 sm:flex-initial">
              <SearchGroup />
            </div>

            <ModeToggle />
          </div>
        </header>

        {/* Main Content */}
        <div className="h-[85vh] overflow-auto">
          <Outlet />

          {/* Footer */}
          <footer>
            <div className="w-full mx-auto max-w-screen-xl p-4 flex items-center justify-center mb-10">
              <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
                © 2024{" "}
                <a href="#" className="hover:underline">
                  LingoMeet™
                </a>
                . All Rights Reserved.
              </span>
            </div>
          </footer>
        </div>
      </div>

      {/* Bottom Navbar for mobile */}

      <nav className="fixed z-40 w-full h-16 max-w-lg -translate-x-1/2 bg-white border border-gray-200 rounded-t-full -bottom-1 left-1/2 dark:bg-gray-700 dark:border-gray-600 overflow-hidden">
        <div className="grid h-full max-w-lg grid-cols-3 mx-auto">
          <Link
            to="/"
            className="inline-flex flex-col items-center justify-center px-5 "
          >
            <svg
              className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
            </svg>
            <span className="sr-only">Home</span>
          </Link>

          <div className="flex items-center justify-center">
            <CreateGroup />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                data-tooltip-target="tooltip-profile"
                type="button"
                className="inline-flex flex-col items-center justify-center px-5 group"
              >
                <svg
                  className="w-5 h-5 mb-1 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
                </svg>
                <span className="sr-only">Profile</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>MyAccount</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/settings" className="w-full">
                  <p>Setting</p>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/support" className="w-full">
                  <p>Support</p>
                </Link>
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/signout" className="w-full">
                  <p>{t("layout.logout")}</p>
                </Link>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
          <div
            id="tooltip-profile"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
          >
            Profile
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>
      </nav>

      {/* Toaster */}
      <Toaster />
    </div>
  );
};

export default Layout;
