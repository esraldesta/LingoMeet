import React from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import API from "@/api/axios";
import { GOOGLE_CLIENT_ID } from "@/constants/config";
export default function GoogleAuth() {
  return (
    <div>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <GoogleLogin
          onSuccess={(credentialResponse) => {
            API.post("/auth/google", {
              headers: {
                "Content-Type": "application/json",
              },

              credential: credentialResponse.credential,
              clientId: credentialResponse.clientId,
            }).then((response) => {
              console.log(response);
            });
          }}
          onError={() => {
            console.log("Login Failed");
          }}
        />
      </GoogleOAuthProvider>
    </div>
  );
}
