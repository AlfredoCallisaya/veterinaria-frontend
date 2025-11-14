import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';

interface User {
  id: number | string;
  nombre: string;
  apellido: string;
  correo: string;
  rol_nombre: string;
  telefono?: string;
  direccion?: string;
  estado?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    console.log('🔐 Iniciando verificación de autenticación...');

    const savedUser = localStorage.getItem('vetCurrentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        console.log('✅ Usuario encontrado en localStorage:', userData);
      } catch (error) {
        console.error('❌ Error parsing saved user:', error);
        localStorage.removeItem('vetCurrentUser');
      }
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    console.log('🔐 Intentando login:', email);

    try {
      // 1. Buscar usuario en la API
      const response = await fetch(`${API_URL}/usuarios`);

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor');
      }

      const usuarios = await response.json();

      // Buscar usuario por correo y contraseña
      const usuarioEncontrado = usuarios.find(
        (u: any) => u.correo === email && u.contrasena === password
      );

      if (usuarioEncontrado) {
        // Verificar si el usuario está activo
        if (usuarioEncontrado.estado !== 'Activo') {
          return {
            success: false,
            message: 'Tu cuenta está inactiva. Contacta al administrador.',
          };
        }

        const userData: User = {
          id: usuarioEncontrado.id,
          nombre: usuarioEncontrado.nombre,
          apellido: usuarioEncontrado.apellido,
          correo: usuarioEncontrado.correo,
          rol_nombre: usuarioEncontrado.rol_nombre,
          telefono: usuarioEncontrado.telefono,
          direccion: usuarioEncontrado.direccion,
          estado: usuarioEncontrado.estado,
        };

        setUser(userData);
        localStorage.setItem('vetCurrentUser', JSON.stringify(userData));
        console.log('✅ Login exitoso:', userData);
        return { success: true };
      }

      // 2. Si no encuentra en la API, buscar en localStorage (para compatibilidad)
      const usuariosRegistrados = JSON.parse(
        localStorage.getItem('vetUsers') || '[]'
      );
      const usuarioRegistrado = usuariosRegistrados.find(
        (u: any) => u.correo === email && u.contrasena === password
      );

      if (usuarioRegistrado) {
        const userData: User = {
          id: usuarioRegistrado.id,
          nombre: usuarioRegistrado.nombre || usuarioRegistrado.nombres,
          apellido: usuarioRegistrado.apellido || usuarioRegistrado.apellidos,
          correo: usuarioRegistrado.correo,
          rol_nombre: usuarioRegistrado.rol_nombre || 'Cliente',
          telefono: usuarioRegistrado.telefono,
          direccion: usuarioRegistrado.direccion,
        };

        setUser(userData);
        localStorage.setItem('vetCurrentUser', JSON.stringify(userData));
        console.log('✅ Login exitoso (usuario local):', userData);
        return { success: true };
      }

      // 3. Si no encuentra en ningún lado
      console.log('❌ Credenciales incorrectas');
      return {
        success: false,
        message: 'Correo electrónico o contraseña incorrectos',
      };
    } catch (error) {
      console.error('❌ Error en login:', error);

      // Fallback: intentar con usuarios locales si la API falla
      try {
        const usuariosRegistrados = JSON.parse(
          localStorage.getItem('vetUsers') || '[]'
        );
        const usuarioRegistrado = usuariosRegistrados.find(
          (u: any) => u.correo === email && u.contrasena === password
        );

        if (usuarioRegistrado) {
          const userData: User = {
            id: usuarioRegistrado.id,
            nombre: usuarioRegistrado.nombre || usuarioRegistrado.nombres,
            apellido: usuarioRegistrado.apellido || usuarioRegistrado.apellidos,
            correo: usuarioRegistrado.correo,
            rol_nombre: usuarioRegistrado.rol_nombre || 'Cliente',
            telefono: usuarioRegistrado.telefono,
            direccion: usuarioRegistrado.direccion,
          };

          setUser(userData);
          localStorage.setItem('vetCurrentUser', JSON.stringify(userData));
          console.log('✅ Login exitoso (fallback local):', userData);
          return { success: true };
        }
      } catch (fallbackError) {
        console.error('❌ Error en fallback login:', fallbackError);
      }

      return {
        success: false,
        message: 'Error al conectar con el servidor. Intenta nuevamente.',
      };
    }
  };

  const logout = () => {
    console.log('🚪 Cerrando sesión...');
    setUser(null);
    localStorage.removeItem('vetCurrentUser');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
