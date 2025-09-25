import { Outlet, Link } from "react-router-dom";
import { ModeToggle } from "../components/toggle/mode-toggle";
import { Toaster } from "@/components/ui/toaster";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CreateGroup } from "@/components/dialogs/CreateGroup";
import SearchGroup from "@/components/SearchGroup";

const Layout = () => {
  return (
    <div className="flex w-full flex-col">
      {/* Header */}
      <div className="flex flex-col sm:gap-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:border-0 sm:bg-transparent sm:px-6 mb-1">
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

      {/* Toaster */}
      <Toaster />
    </div>
  );
};

export default Layout;
