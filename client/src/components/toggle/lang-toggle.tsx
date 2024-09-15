import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import * as React from "react"
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export function LangToggle() {
  const [t, i18n] = useTranslation("global");

  // Load preferred language from localStorage when the component mounts
  React.useEffect(() => {
    const storedLang = localStorage.getItem("preferredLanguage");
    if (storedLang) {
      i18n.changeLanguage(storedLang);
    }
  }, [i18n]);

  // Handle language change and store the preference in localStorage
  const handleChangeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="small">
          <Globe strokeWidth={1.75} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleChangeLanguage("en")}>
          En
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChangeLanguage("tig")}>
          Tig
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleChangeLanguage("am")}>
          Am
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
