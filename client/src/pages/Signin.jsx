import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useContext } from "react";

import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../components/ui/use-toast";
import ClosedEye from "../components/icons/ClosedEye";
import OpenedEye from "../components/icons/OpenedEye";

export default function Signin() {
  const { toast } = useToast();
  let navigate = useNavigate();

  const { login } = useContext(AuthContext);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    API.post("/member/login", {
      phoneNumber,
      password,
    })
      .then((res) => {
        const { accessToken, refreshToken } = res.data.data.tokens;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        login(res.data.user);
        setError("");
        toast({
          description: "Logged in Successfuly",
        });
        setIsLoading(false);
        navigate("/");
      })
      .catch((err) => {
        setError(
          err.response?.data?.message || "Login failed. Please try again."
        );
        setIsLoading(false);
      });
  };
  return (
    <form onSubmit={handleSubmit} className="mx-auto">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Signin</CardTitle>
          <CardDescription>
            Enter your phone number below to login to your account.
          </CardDescription>
          {error && <div className="text-red-600 mb-[10px]">{error}</div>}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label className="text-left" htmlFor="phoneNumber">
              PhoneNumber
            </Label>
            <Input
              id="phoneNumber"
              placeholder="PhoneNumber ..."
              onChange={(e) => setPhoneNumber(e.target.value)}
              value={phoneNumber}
            />
          </div>

          <div className="space-y-1 text-left">
            <Label className="" htmlFor="password">
              Password
            </Label>
            <div className="flex items-center relative">
              <Input
                id="password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Your password ..."
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />
              <div
                className="absolute top-3 right-2"
                onClick={() => {
                  togglePasswordVisibility();
                }}
              >
                {passwordVisible ? <ClosedEye/> : <OpenedEye/>}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "loading" : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
