/*
==========================================================
CCNA Exam Simulator
Timer
==========================================================

Responsabilidades

• Controlar o tempo da prova
• Calcular tempo restante
• Calcular tempo decorrido

==========================================================
*/

class Timer {

    constructor(app) {

        this.app = app;

        this.duration = 0;

        this.startTimestamp = null;

        this.pauseTimestamp = null;

        this.running = false;

        this.paused = false;

    }

    /*
    ======================================================
    Inicialização
    ======================================================
    */

    initialize(duration) {

        this.duration = duration;

        this.reset();

    }

    /*
    ======================================================
    Controle
    ======================================================
    */

    start() {

        if (this.running) {

            return;

        }

        this.startTimestamp = Date.now();

        this.pauseTimestamp = null;

        this.running = true;

        this.paused = false;

    }

    pause() {

        if (!this.running || this.paused) {

            return;

        }

        this.pauseTimestamp = Date.now();

        this.paused = true;

    }

    resume() {

        if (!this.paused) {

            return;

        }

        const pausedTime =

            Date.now() -

            this.pauseTimestamp;

        this.startTimestamp += pausedTime;

        this.pauseTimestamp = null;

        this.paused = false;

    }

    stop() {

        this.running = false;

        this.paused = false;

    }

    reset() {

        this.startTimestamp = null;

        this.pauseTimestamp = null;

        this.running = false;

        this.paused = false;

    }

    /*
    ======================================================
    Consultas
    ======================================================
    */

    getDuration() {

        return this.duration;

    }

   getElapsedTime() {

    if (!this.running) {

        return 0;

    }

    const now = this.paused

        ? this.pauseTimestamp

        : Date.now();

    return Math.floor(

        (now - this.startTimestamp) / 1000

    );

}

    getRemainingTime() {

       return Math.max(

        this.duration -

        this.getElapsedTime(),

        0

    );

}

    getRemainingSeconds() {

        return this.getRemainingTime();

    }

    /*
    ======================================================
    Formatação
    ======================================================
    */

    getFormattedTime() {

        const totalSeconds =

            this.getRemainingTime();

        const hours = Math.floor(

            totalSeconds / 3600

        );

        const minutes = Math.floor(

            (totalSeconds % 3600) / 60

        );

        const seconds =

            totalSeconds % 60;

        return [

            String(hours).padStart(2, "0"),

            String(minutes).padStart(2, "0"),

            String(seconds).padStart(2, "0")

        ].join(":");

    }

    /*
    ======================================================
    Estado
    ======================================================
    */

    isRunning() {

        return this.running;

    }

    isPaused() {

        return this.paused;

    }

    isStopped() {

        return !this.running;

    }

    isExpired() {

        return (

            this.getRemainingTime() <= 0

        );

    }

    /*
    ======================================================
    Informações
    ======================================================
    */

    getStatus() {

        return {

            duration: this.getDuration(),

            elapsed: this.getElapsedTime(),

            remaining: this.getRemainingTime(),

            running: this.isRunning(),

            paused: this.isPaused(),

            expired: this.isExpired()

        };

    }

}