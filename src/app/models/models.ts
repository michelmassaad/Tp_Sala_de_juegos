
//Representa los datos de la tabla pública 'users' en Supabase.

export interface PerfilUsuario {
    id?: number;          
    created_at?: string;  
    authId?: string;       // uuid (Foreign Key)
    correo: string;       
    nombre: string;       
    apellido: string;     
    edad: number;         
}


//Representa el estado básico de la sesión del usuario.
 
export interface SesionUsuario {
    id: string;           
    email: string;   
    nombre: string;       
    apellido: string;     
    edad: number;  
}


//Representa los datos de la tabla 'sala-chat' en Supabase.

export interface Mensaje {
  id: number;
  user_id: string;
  nombre_usuario: string; // <-- Ajustado al nombre exacto de tu columna
  contenido: string;
  created_at: string;
}