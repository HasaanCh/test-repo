import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { fetch_api } from '@/helpers/api_nilchat'
import { object } from 'zod'


function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET

  if (!clientId || clientId.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_ID')
  }

  if (!clientSecret || clientSecret.length === 0) {
    throw new Error('Missing GOOGLE_CLIENT_SECRET')
  }

  return { clientId, clientSecret }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: getGoogleCredentials().clientId,
      clientSecret: getGoogleCredentials().clientSecret,
      httpOptions: {
        timeout: 10000,
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },
    async signIn({ user }) {
      // Send email to custom API
      console.log(user.email);
      const nilchat_user = await fetch_api("post",[user.email??"",user.name??""], "accounts");
      console.log("================================")
      console.log(nilchat_user);
      console.log("================================")

      return true;
    },
    redirect() {
      return '/dashboard'
    },
  },
}
