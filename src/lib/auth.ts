
import pool from './database';

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

// Simple hash function for browser compatibility (not production-ready)
const simpleHash = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fitlife-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Simple token generation
const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  return btoa(JSON.stringify(payload));
};

// Simple token verification
const verifyToken = (token: string): any => {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch (error) {
    return null;
  }
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    console.log('Attempting sign in for:', email);
    
    const result = await pool.query(
      'SELECT * FROM profiles WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { user: null, token: null, error: 'Credenciais inválidas' };
    }

    const user = result.rows[0];
    const hashedPassword = await simpleHash(password);

    if (hashedPassword !== user.password) {
      return { user: null, token: null, error: 'Credenciais inválidas' };
    }

    const userProfile: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status
    };

    const token = generateToken(userProfile);

    return { user: userProfile, token, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, token: null, error: 'Erro interno do servidor' };
  }
};

export const signUp = async (email: string, password: string, name: string): Promise<AuthResponse> => {
  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return { user: null, token: null, error: 'Usuário já existe' };
    }

    const hashedPassword = await simpleHash(password);
    const userId = crypto.randomUUID();

    const result = await pool.query(
      'INSERT INTO profiles (id, email, password, name, role, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userId, email, hashedPassword, name, 'user', 'active']
    );

    const user: User = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      name: result.rows[0].name,
      role: result.rows[0].role,
      status: result.rows[0].status
    };

    const token = generateToken(user);

    return { user, token, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, token: null, error: 'Erro interno do servidor' };
  }
};

export const getCurrentUser = (token: string): User | null => {
  const decoded = verifyToken(token);
  if (!decoded) return null;

  return {
    id: decoded.id,
    email: decoded.email,
    name: decoded.name || decoded.email,
    role: decoded.role,
    status: 'active'
  };
};
