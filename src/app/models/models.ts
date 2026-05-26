
//Representa los datos de la tabla pública 'users' en Supabase.

export interface PerfilUsuario {
    id?: number;          
    created_at?: string;  
    authId?: string;       // uuid (Foreign Key)
    correo: string;       
    nombre: string;       
    apellido: string;     
    edad: number;
    monedas?: number;
}


//Representa el estado básico de la sesión del usuario.
 
export interface SesionUsuario {
    id: string;           
    email: string;   
    nombre: string;       
    apellido: string;     
    edad: number;  
    monedas: number;
}


//Representa los datos de la tabla 'sala-chat' en Supabase.

export interface Mensaje {
  id: number;
  user_id: string;
  nombre_usuario: string; // <-- Ajustado al nombre exacto de tu columna
  contenido: string;
  created_at: string;
}

//Representa los datos de la tabla 'partidas' en Supabase.

export interface ResultadoPartida {
  user_id?: string;
  nombre_completo?: string; // Campo adicional para mostrar el nombre completo del usuario
  created_at?: string; 
  juego: 'AHORCADO' | 'MAYOR_MENOR' | 'PREGUNTADOS' | 'BICI_RUSH';
  puntaje: number;
  victoria: boolean;
  tiempo_de_partida: number; //  Tiempo en Segundos
  detalles: string;
}

// Creamos el molde de lo que puede venir adentro del JSON
export interface DetallesPartida {
  palabra?: string;               // Usado en Ahorcado
  letrasSeleccionadas?: number;   // Usado en Ahorcado
  errores?: number;               // Usado en Ahorcado
  cartasAcertadas?:number;          // Usado en Mayor_Menor
  rachaMaxima?:number;            // Usado en Mayor_Menor
  preguntasAcertadas?:number;           // Usado en PREGUNTADOS
  monedasGanadas?:number;           // Usado en BICI_RUSH
  distanciaMetros?:number;          // Usado en BICI_RUSH
}