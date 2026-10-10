import InputPassword from "./inputPassword";
import { useState } from "react";
import PasswordChanged from "./passwordChanged";
import { useSearch } from "@tanstack/react-router";

export default function ChangePasswordComponent() {
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);
  const { token } = useSearch({
    from: "/(auth)/reset-password_/reset",
  });

  return (
    <div className="flex w-full h-full items-center justify-center">
      {isPasswordChanged ? (
        <PasswordChanged />
      ) : (
        <InputPassword
          setisPasswordChanged={setIsPasswordChanged}
          token={token}
        />
      )}
    </div>
  );
}
