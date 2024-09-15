import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Button } from "../components/ui/button";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Transition from "../components/Transition";
import { useTranslation } from "react-i18next";

const Logout = () => {
  const { t } = useTranslation("global");
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleCancel = () => {
    navigate("/");
  };
  return (
    <Transition>
      <Card className="max-w-[350px] mx-auto mt-5">
        <CardHeader>
          <CardTitle>{t('logout.title')}</CardTitle>
          <CardDescription>{t("logout.des")}</CardDescription>
        </CardHeader>

        <CardFooter className="flex justify-between">
          <Button onClick={handleCancel}>{t("logout.declain")}</Button>
          <Button variant="destructive" onClick={handleLogout}>
            {t("logout.confirm")}
          </Button>
        </CardFooter>
      </Card>
    </Transition>
  );
};

export default Logout;
