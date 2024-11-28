import { useState } from "react";
import { Navigate } from "react-router-dom";

interface AuthenticatedProps {
    children: React.ReactNode;
}

const Athenticated: React.FC<AuthenticatedProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    if (!isLoggedIn) {
        return <Navigate to={"/login"} replace={true} />;
    }

    return <div>{children}</div>;
};

export default Athenticated;
