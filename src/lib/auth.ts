import { MongoDBAdapter } from "@auth/mongodb-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import clientPromise from "./mongodb";
import dbConnect from "./db";
import User from "@/models/User";
import { getServerSession } from "next-auth";

export const authConfig = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email e senha são obrigatórios");
        }

        await dbConnect();
        
        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("Usuário não encontrado");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Senha incorreta");
        }
        

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
      
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const auth = () => getServerSession(authConfig);

export const isAdmin = async () => {
  const session = await auth();
  return session?.user?.role === "admin";
};

export const requireAuth = async (isAdminRequired = false) => {
  const session = await auth();
  
  if (!session) {
    throw new Error("Não autorizado");
  }

  if (isAdminRequired && session.user.role !== "admin") {
    throw new Error("Acesso restrito a administradores");
  }

  return session;
};