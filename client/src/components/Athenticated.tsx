import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store/store";

interface AuthenticatedProps {
  children: React.ReactNode;
}

const Athenticated: React.FC<AuthenticatedProps> = ({ children }) => {
  const { token } = useSelector((state: RootState) => state.user);

  if (!token) {
    return <Navigate to={"/login"} replace={true} />;
  }

  return <div>{children}</div>;
};

export default Athenticated;
