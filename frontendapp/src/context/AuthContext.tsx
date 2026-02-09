// src/context/AuthContext.tsx
import React, { createContext, useEffect, useState, ReactNode } from 'react';
import {
  loginUser,
  signupUser,
  verifyOtp,
  verifyPassword,
} from '../api/authApi/authApi';
import {
  saveToken,
  saveUser,
  getToken,
  getUser,
  removeToken,
  removeUser,
} from '../services/storageService';

type User = {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  roles?: string[];
};

type LoginPayload = {
  Email?: string;
  Phone?: string;
};

type SignupPayload = {
  FirstName: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Password?: string;
  Otp?: string;
};

type OtpPayload = {
  Email?: string;
  Phone?: string;
  Otp: string;
};

type PasswordPayload = {
  Email?: string;
  Phone?: string;
  Password: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isPasswordVerified: boolean;
  isOtpVerified: boolean;
  setIsPasswordVerified: (val: boolean) => void;
  setIsOtpVerified: (val: boolean) => void;
  signIn: (payload: LoginPayload) => Promise<any>;
  signUp: (payload: SignupPayload) => Promise<any>;
  verifyOtpCode: (payload: OtpPayload) => Promise<any>;
  verifyUserPassword: (payload: PasswordPayload) => Promise<any>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // new flags
  const [isPasswordVerified, setIsPasswordVerified] = useState<boolean>(false);
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const storedUser = await getUser();
        if (token && storedUser) {
          setUser(storedUser as User);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (payload: LoginPayload) => {
    setLoading(true);
    try {
      const res = await loginUser(payload);
      const { token, user } = res;
      if (token) await saveToken(token);
      if (user) await saveUser(user);
      setUser(user);
      setIsPasswordVerified(false);
      setIsOtpVerified(false);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (payload: SignupPayload) => {
    setLoading(true);
    try {

      const res = await signupUser(payload);
      const { user } = res;
      if (user){
     await saveUser(user);
      setUser(user);
      setIsOtpVerified(true)
      } 
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpCode = async (payload: OtpPayload) => {
    setLoading(true);
    try {
      const res = await verifyOtp(payload);
      const { token, user } = res;
      if (token) await saveToken(token);
      if (user) await saveUser(user);
      setUser(user);
      setIsOtpVerified(true);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyUserPassword = async (payload: PasswordPayload) => {
    setLoading(true);
    try {
      const res = await verifyPassword(payload);
      const { user } = res;
      if (user) await saveUser(user);
      setUser(user);
      setIsPasswordVerified(true);
      return res;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await removeToken();
      await removeUser();
      setUser(null);
      setIsPasswordVerified(false);
      setIsOtpVerified(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPasswordVerified,
        isOtpVerified,
        setIsPasswordVerified,
        setIsOtpVerified,
        signIn,
        signUp,
        verifyOtpCode,
        verifyUserPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
