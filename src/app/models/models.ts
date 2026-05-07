
//Representa los datos de la tabla pública 'users' en Supabase.

export interface PerfilUsuario {
    id?: number;          
    created_at?: string;  
    authId: string;       // uuid (Foreign Key)
    correo: string;       
    nombre: string;       
    apellido: string;     
    edad: number;         
}


//Representa el estado básico de la sesión del usuario.
 
export interface SesionUsuario {
    id: string;           
    email: string;        
}