import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';

// 5. Crear el cliente de supabase indicando la URL y public-anon-key
const supabase = createClient(environment.UrlSupabase, environment.KeySupabase);

@Injectable({
    providedIn: 'root'
})

export class SupabaseService {
  // Exponemos la variable supabase para usarla en los componentes
  public cliente = supabase; 
}