import { useState } from "react";
import Header from "../components/Header";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const Profile = () => {
  const { id, firstName, lastName, email, prefferedLanguage, avatar } =
    useSelector((state: RootState) => state.user);

  const [firstNameState, setFirstNameState] = useState(firstName || "");
  const [lastNameState, setLastNameState] = useState(lastName || "");
  const [emailState, setEmailState] = useState(email || "");
  const [passwordState, setPasswordState] = useState("");
  const [prefferedLanguageState, setPrefferedLanguageState] = useState(prefferedLanguage || "de");

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(firstNameState, lastNameState, emailState, passwordState, prefferedLanguageState);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center h-screen justify-center">
        <div className="mx-auto  px-10 py-10 rounded-md w-96 bg-gray-100">
          <div className="text-2xl font-bold mb-4 text-center">Profile</div>

          <form
            className="flex flex-col items-center justify-center gap-2 w-full"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col items-start justify-start gap-1 w-full">
              <div className="text-lg font-medium pl-1">First Name</div>
              <input
                type="text"
                placeholder="First Name"
                className="border p-2 rounded-md w-full outline-none"
                value={firstNameState}
                onChange={(e) => setFirstNameState(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-start justify-start w-full">
              <div className="text-lg font-medium pl-1">Last Name</div>
              <input
                type="text"
                placeholder="Last Name"
                className="border p-2 rounded-md w-full outline-none"
                value={lastNameState}
                onChange={(e) => setLastNameState(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-start justify-start w-full">
              <div className="text-lg font-medium pl-1">Email</div>
              <input
                type="email"
                placeholder="Email"
                className="border p-2 rounded-md w-full outline-none"
                value={emailState}
                onChange={(e) => setEmailState(e.target.value)}
              />
            </div>

            <div className="flex flex-col items-start justify-start w-full">
              <div className="text-lg font-medium pl-1">Password</div>
              {showPassword ? (
                <div className="flex w-full items-center justify-center gap-1 bg-white border rounded-md px-1">
                  <input
                    type="text"
                    placeholder="Password"
                    className="p-2 rounded-md w-full outline-none"
                    value={passwordState}
                    onChange={(e) => setPasswordState(e.target.value)}
                  />
                  <FaEyeSlash
                    className="cursor-pointer self-center"
                    onClick={() => setShowPassword(false)}
                  />
                </div>
              ) : (
                <div className="flex w-full items-center justify-center gap-1 bg-white border rounded-md px-1">
                  <input
                    type="password"
                    placeholder="Password"
                    className="p-2 rounded-md w-full outline-none"
                    value={passwordState}
                    onChange={(e) => setPasswordState(e.target.value)}
                  />
                  <FaEye
                    className="cursor-pointer self-center"
                    onClick={() => setShowPassword(true)}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 w-full px-8 mt-4 mb-2">
              <label className="w-24">Sprache</label>
              <select
                className="p-2 border rounded-md w-80 outline-none"
                value={prefferedLanguageState}
                onChange={(e) => setPrefferedLanguageState(e.target.value)}
                required
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
                <option value="ru">Russian</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
                <option value="ko">Korean</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-black text-white p-2 mt-4 rounded-md w-full"
            >
              Update
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
