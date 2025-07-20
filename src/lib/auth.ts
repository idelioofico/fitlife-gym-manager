import { signIn as apiSignIn } from './api';
import { env } from '../config/env';

const API_URL = env.API_URL;

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

export interface AuthResponse {
  user: User | null;
  token: string | null;
  error: string | null;
}

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await apiSignIn(email, password);
    return {
      user: response.user,
      token: response.token,
      error: null
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return { 
      user: null, 
      token: null, 
      error: error instanceof Error ? error.message : 'Erro interno do servidor' 
    };
  }
};

export const signUp = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name, role: 'user' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        user: null, 
        token: null, 
        error: errorData.error || 'Erro ao criar usuário' 
      };
    }

    const data = await response.json();
    return {
      user: data.user,
      token: data.token,
      error: null
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return { 
      user: null, 
      token: null, 
      error: 'Erro interno do servidor' 
    };
  }
};

export const getCurrentUser = (token: string): User | null => {
  try {
    // Split the token to get the payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name || decoded.email,
      role: decoded.role,
      status: 'active'
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};
