// frontend/src/contexts/AuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// --- DEFINIÇÃO DE TIPOS ---
export interface User {
  id: string;
  name: string;
  email: string;
  role: "CLIENT" | "ADMIN"; // role do front, mapeada do backend
  phone?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phone: string,
    consent: boolean
  ) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

// --- SETUP DO CONTEXTO ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// --- PROVIDER ---
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carrega dados do localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("@App:token");
    const storedUser = localStorage.getItem("@App:user");

    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);

      // Mapear userType do backend para role do front
      const mappedUser: User = {
        id: parsedUser.id,
        name: parsedUser.name,
        email: parsedUser.email,
        phone: parsedUser.phone,
        role: parsedUser.userType === "ADMIN" ? "ADMIN" : "CLIENT",
      };

      setToken(storedToken);
      setUser(mappedUser);

      // 🔹 Redirecionamento automático para admin se for ADMIN
      if (
        mappedUser.role === "ADMIN" &&
        window.location.pathname !== "/admin"
      ) {
        window.location.href = "/admin"; // ou router.push("/admin") se dentro de componente Next
      }
    }

    setIsLoading(false);
  }, []);

  // --- LOGIN ---
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return {
          error: new Error("Resposta inválida do servidor (HTML recebido)."),
        };
      }

      if (!response.ok) {
        return { error: new Error(data.error || "Falha na autenticação.") };
      }

      const { token, user: userData } = data;

      // Mapear userType para role
      const mappedUser: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.userType === "ADMIN" ? "ADMIN" : "CLIENT",
      };

      setToken(token);
      setUser(mappedUser);
      localStorage.setItem("@App:token", token);
      localStorage.setItem("@App:user", JSON.stringify(mappedUser));

      return { error: null };
    } catch (err) {
      return {
        error: new Error("Erro de rede. Verifique se o back-end está rodando."),
      };
    }
  };

  // --- CADASTRO ---
  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone: string,
    consent: boolean
  ) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone, consent }),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        return {
          error: new Error("Resposta inválida do servidor (HTML recebido)."),
        };
      }

      if (!response.ok) {
        return {
          error: new Error(data.error || "Falha ao cadastrar usuário."),
        };
      }

      return { error: null };
    } catch (err) {
      return {
        error: new Error("Erro de rede. Verifique se o back-end está rodando."),
      };
    }
  };

  // --- LOGOUT ---
  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("@App:token");
    localStorage.removeItem("@App:user");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// --- HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
