import { signIn as apiSignIn } from './api';

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
