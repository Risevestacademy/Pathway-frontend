import InputPassword from "./inputPassword";
import { useState } from "react";
import PasswordChanged from "./passwordChanged";

export default function ChangePasswordComponent() {
  const [isPasswordChanged, setIsPasswordChanged] = useState(false);

  return (
    <div className="flex w-full h-full items-center justify-center">
      {isPasswordChanged ? (
        <PasswordChanged setisPasswordChanged={setIsPasswordChanged} />
      ) : (
        <InputPassword setisPasswordChanged={setIsPasswordChanged} />
      )}
    </div>
  );
}
