import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
} from "lucide-react";
import axios from "axios";
import bgImage from "../images/bg-img-login.jpeg";

const API_URL = "https://parcouradminjoyatwork-production.up.railway.app";

const joyColors = {
  primary: "#3B82F6",
  secondary: "#4ADE80",
  accent: "#7FF8AB",
};

type RoleType = "admin";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    entreprise_id: number | null;
    roles?: string[];
  };
};

const roleLabels: Record<RoleType, string> = {
  admin: "Connexion Administrateur",
};

const roleDescriptions: Record<RoleType, string> = {
  admin: "Supervisez la plateforme JoyAtWork.",
};

const Login: React.FC = () => {
  const role: RoleType = "admin";
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // ✅ 1️⃣ Demande du cookie CSRF (OBLIGATOIRE avec Sanctum)
      await axios.get(
        `${API_URL}/sanctum/csrf-cookie`,
        { withCredentials: true }
      );

      // ✅ 2️⃣ Login administrateur
      const response = await axios.post<LoginResponse>(
        `${API_URL}/api/login`,
        {
          email: email.trim(),
          password,
        },
        { withCredentials: true }
      );

      const data = response.data;
      const userRoles: string[] = data?.user?.roles ?? [];
      const isAdmin = userRoles.includes("admin");

      if (!isAdmin) {
        alert("Accès refusé : cette interface est réservée aux administrateurs.");
        return;
      }

      // ✅ Sauvegarde locale
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ Redirection
      navigate("/dashboard");

    } catch (error) {
      console.error(error);
      alert("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center px-4 py-6"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-lg animate-in fade-in duration-500">
        <Card className="shadow-2xl bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden border border-gray-200/90">
          <CardHeader
            className="text-center py-7"
            style={{
              background: `linear-gradient(135deg, ${joyColors.primary}, ${joyColors.secondary}, ${joyColors.accent})`,
              color: "white",
            }}
          >
            <CardTitle className="text-2xl sm:text-3xl font-bold">
              {roleLabels[role]}
            </CardTitle>
            <CardDescription className="text-white/90">
              {roleDescriptions[role]}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8 space-y-6 border-t border-gray-100/80">
            <div className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 py-2 text-sm font-medium text-gray-700">
              <ShieldCheck size={18} className="text-gray-600" />
              Espace Administrateur
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <Label htmlFor="email">E-mail professionnel</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div className="relative">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white h-11"
                style={{
                  background: `linear-gradient(90deg, ${joyColors.primary}, ${joyColors.secondary})`,
                }}
              >
                <LogIn size={18} className="mr-2" />
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;