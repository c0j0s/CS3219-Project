"use client";
import LogoLoadingComponent from "@/components/common/LogoLoadingComponent";
import { AuthService } from "@/helpers/auth/auth_api_wrappers";
import { Role } from "@/types/enums";
import User from "@/types/user";
import { StringUtils } from "@/utils/stringUtils";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

interface IAuthContext {
  user: User;
  mutate: (preventLoading: boolean) => Promise<void>;
  isAuthenticated: boolean;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const defaultUser: User = {
  id: "",
  name: "",
  email: "",
  role: Role.USER,
  image: "",
  preferences: {
    languages: [],
    difficulties: [],
    topics: [],
  },
};

const AuthContext = createContext<IAuthContext>({
  user: defaultUser,
  mutate: () => Promise.resolve(),
  isAuthenticated: false,
  logIn: (email: string, password: string) => Promise.resolve(),
  logOut: () => Promise.resolve(),
});

interface IAuthProvider {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: IAuthProvider) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  //fetch user using JWT cookie
  const fetchUser = async (preventLoading?: boolean) => {
    !preventLoading && setIsLoading(true);
    try {
      const rawUser = await AuthService.validateUser();
      updateUser(rawUser);
    } catch (error) {
      console.log({ error });
      setUser(defaultUser);
    } finally {
      !preventLoading && setIsLoading(false);
    }
  };

  //formats preferences and sets user in state
  const updateUser = (rawUser: User) => {
    formatPreferences(rawUser);
    setUser(rawUser);
  };

  const formatPreferences = (rawUser: User) => {
    rawUser.preferences = {
      languages: rawUser.preferences?.languages || [],
      difficulties: rawUser.preferences?.difficulties || [],
      topics: rawUser.preferences?.topics || [],
    };
  };

  const logIn = async (email: string, password: string) => {
    await AuthService.logInByEmail(email, password);
    await fetchUser(true);
  };

  const logOut = async () => {
    setUser(defaultUser);
    await AuthService.logOut();
  };

  const renderComponents = () => {
    if (isLoading) {
      // this is the loading component that will render in every page when fetching user auth status
      return <LogoLoadingComponent />;
    }
    return children;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        mutate: fetchUser,
        isAuthenticated: !!user.id,
        logIn,
        logOut,
      }}
    >
      {renderComponents()}
    </AuthContext.Provider>
  );
};

const useAuthContext = () => useContext(AuthContext);

export { useAuthContext, AuthProvider };
