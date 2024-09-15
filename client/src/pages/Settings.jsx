import { useTranslation } from "react-i18next";

export default function Settings() {
    const { t} = useTranslation("global");

    return (
    <div>
        
        <p>Settings</p>
        <p>{t("coming.message")}</p>
    </div>
  )
}
