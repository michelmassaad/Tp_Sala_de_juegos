import { Injectable, signal, computed, OnDestroy } from '@angular/core';

@Injectable()
export class CronometroService implements OnDestroy {

    // Instanciado puramente con 0
    private intervaloTimer: number = 0;
    public tiempoTranscurrido = signal(0);

    public tiempoFormateado = computed(() => {
        const totalSegundos = this.tiempoTranscurrido();
        const minutos = Math.floor(totalSegundos / 60).toString().padStart(2, '0');
        const segundos = (totalSegundos % 60).toString().padStart(2, '0');
        return `${minutos}:${segundos}`;
    });

    iniciarCronometro() {
        this.detenerCronometro();
        this.tiempoTranscurrido.set(0);

        this.intervaloTimer = setInterval(() => {
            this.tiempoTranscurrido.update(t => t + 1);
        }, 1000) ;
    }

    detenerCronometro() {
        if (this.intervaloTimer !== 0) {
            clearInterval(this.intervaloTimer);
            this.intervaloTimer = 0;
        }
    }

    ngOnDestroy() {
        this.detenerCronometro();
    }
}