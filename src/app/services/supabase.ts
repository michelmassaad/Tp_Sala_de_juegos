import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
    
    // CORRECCIÓN: Usar dos puntos (:) en lugar del signo igual (=)
    private cliente: SupabaseClient;

    constructor() {
        const UrlSupabase = environment.UrlSupabase; 
        const KeySupabase = environment.KeySupabase;

        this.cliente = createClient(UrlSupabase, KeySupabase);
    }

    getClient(): SupabaseClient {
        return this.cliente;
    }
}