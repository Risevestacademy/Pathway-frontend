import SendEmailComponent from "./sendEmail";
import EmailSentComponent from "./emailSent";
import { useState } from "react";

export default function ResetPasswordComponent() {
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="flex w-full h-full items-center justify-center">
      {isEmailSent ? (
        <EmailSentComponent
          setIsEmailSent={setIsEmailSent}
          setEmail={setEmail}
          email={email}
        />
      ) : (
        <SendEmailComponent
          setisEmailSent={setIsEmailSent}
          setEmail={setEmail}
          email={email}
        />
      )}
    </div>
  );
}
