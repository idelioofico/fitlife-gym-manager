
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from './database';

const JWT_SECRET = 'fitlife-secret-key-change-in-production';

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

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: User): string => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { user: null, token: null, error: 'Credenciais inválidas' };
    }

    const user = result.rows[0];
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
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

    const hashedPassword = await hashPassword(password);
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
