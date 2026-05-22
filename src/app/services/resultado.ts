import { Injectable, inject, signal, NgZone } from '@angular/core';
import { AuthService } from './auth'; // Ajustá la ruta real a tu servicio de Auth
import { SupabaseService } from './supabase'; // Ajustá la ruta real a tu servicio de Supabase
import { DetallesPartida, ResultadoPartida } from '../models/models';


@Injectable({ providedIn: 'root' })
export class ResultadosService {
    private supabase = inject(SupabaseService).getClient();
    private authService = inject(AuthService);

    // Signal reactivo para leer las marcas en las tablas de posiciones (Rankings)
    public rankings = signal<ResultadoPartida[]>([]);

    /**
     * Registra el resultado transaccional de cualquier juego en la tabla única de Supabase.
     * Transforma el objeto de detalles libres en string automáticamente mediante JSON.stringify.
     */
    async guardarResultado(
        juego: 'AHORCADO' | 'MAYOR_MENOR' | 'PREGUNTADOS' | 'BICI_RUSH',
        puntaje: number,
        victoria: boolean,
        tiempo_de_partida: number,
        detalles: DetallesPartida
    ): Promise<boolean> {
        const usuarioLogueado = this.authService.user();
        if (!usuarioLogueado) return false;

        const { error } = await this.supabase
            .from('resultados')
            .insert({
                user_id: usuarioLogueado.id,
                juego,
                puntaje,
                victoria,
                tiempo_de_partida,
                detalles
            });

        if (error) {
            console.error("Error al guardar resultado:", error);
            return false;
        }
        return true;
    }

}