"use client";
import React, { useState, useEffect, useCallback } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import { toast } from "sonner";

import { z } from "zod";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Checkbox } from "@/components/ui/checkbox";

import Image from "next/image";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Email inválido" }),

  password: z

    .string()

    .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
});

const signupSchema = z

  .object({
    fullName: z

      .string()

      .trim()

      .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })

      .max(100, { message: "Nome muito longo" }),

    email: z.string().trim().email({ message: "Email inválido" }),

    phone: z

      .string()

      .trim()

      .regex(/^[0-9]{11}$/, {
        message: "Telefone deve ter 11 dígitos numéricos (DDD + número)",
      }),

    password: z

      .string()

      .min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),

    confirmPassword: z.string(),

    consent: z.boolean().refine((val) => val === true, {
      message: "Você deve aceitar os termos de uso e a política de privacidade",
    }),
  })

  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",

    path: ["confirmPassword"],
  });

const Auth = () => {
  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // ⬅️ Tipagem do Evento de Input (HTMLInputElement)

      setter(e.target.value);
    };

  const { signIn, signUp, user } = useAuth();

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");

  const [loginPassword, setLoginPassword] = useState("");

  const [signupFullName, setSignupFullName] = useState("");

  const [signupEmail, setSignupEmail] = useState("");

  const [signupPhone, setSignupPhone] = useState("");

  const [signupPassword, setSignupPassword] = useState("");

  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    if (user) {
      // Redireciona admin para /admin/orders
      if (user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/home");
      }
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const validated = loginSchema.parse({
        email: loginEmail,

        password: loginPassword,
      });

      const { error } = await signIn(validated.email, validated.password);

      if (error) {
        toast.error("Email ou senha incorretos. Tente novamente.");
      } else {
        toast.success("Login realizado com sucesso!");

        router.push("/home");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error("Erro de rede ou Back-end indisponível.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const validated = signupSchema.parse({
        fullName: signupFullName,

        email: signupEmail,

        phone: signupPhone,

        password: signupPassword,

        confirmPassword: signupConfirmPassword,

        consent: termsAccepted,
      });

      const { error } = await signUp(
        validated.email,

        validated.password,

        validated.fullName,

        validated.phone,

        validated.consent
      );

      if (error) {
        toast.error("Erro ao cadastrar: " + error.message);
      } else {
        toast.success("Cadastro realizado com sucesso! Faça login.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.issues[0].message);
      } else {
        toast.error("Erro de rede ou Back-end indisponível.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left side - Image */}

      <div className="hidden lg:block relative overflow-hidden">
        <Image
          src="/assets/hero-food.jpg"
          alt="Comidas deliciosas"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-12">
          <div className="text-white z-10">
            <h1 className="text-5xl font-bold mb-4">UAIfood</h1>

            <p className="text-xl opacity-90">
              Seu delivery de comida favorito!
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Auth forms */}

      <div className="flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8"></div>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Bem-vindo</CardTitle>

              <CardDescription className="text-center">
                Entre com sua conta ou crie uma nova
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>

                  <TabsTrigger value="signup">Cadastro</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>

                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginEmail}
                        onChange={handleChange(setLoginEmail)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Senha</Label>

                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={handleChange(setLoginPassword)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Entrando...
                        </>
                      ) : (
                        "Entrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nome completo</Label>

                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Seu nome"
                        value={signupFullName}
                        onChange={handleChange(setSignupFullName)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>

                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={signupEmail}
                        onChange={handleChange(setSignupEmail)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">
                        Telefone (11 dígitos)
                      </Label>

                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="Ex: 5534988887777"
                        value={signupPhone}
                        onChange={handleChange(setSignupPhone)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Senha</Label>

                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={handleChange(setSignupPassword)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">
                        Confirmar senha
                      </Label>

                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={handleChange(setSignupConfirmPassword)}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={termsAccepted}
                        onCheckedChange={(checked) =>
                          setTermsAccepted(checked === true)
                        }
                        disabled={isLoading}
                        className="mt-1 border-gray-300"
                      />

                      <Label
                        htmlFor="terms"
                        className="text-sm text-gray-700 leading-tight cursor-pointer"
                      >
                        Eu aceito os{" "}
                        <span className="text-primary font-semibold underline">
                          termos de uso
                        </span>{" "}
                        e a{" "}
                        <span className="text-primary font-semibold underline">
                          política de privacidade
                        </span>
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cadastrando...
                        </>
                      ) : (
                        "Cadastrar"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
