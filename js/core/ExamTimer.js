/*
==========================================================
CCNA Exam Simulator
Exam Timer

Arquivo: js/core/ExamTimer.js
==========================================================
*/

class ExamTimer {

    constructor() {

        /*
        Tempo total da prova em segundos.
        */

        this.totalSeconds = 0;


        /*
        Tempo restante.
        */

        this.remainingSeconds = 0;


        /*
        Momento real em que a prova termina.

        Usamos timestamp para evitar perda de precisão
        quando o navegador reduz a frequência do
        setInterval em abas em segundo plano.
        */

        this.endTime = null;


        /*
        Controle interno.
        */

        this.intervalId = null;

        this.running = false;

        this.paused = false;

        this.expired = false;


        /*
        Callbacks.
        */

        this.onTick = null;

        this.onExpire = null;

    }


    /*
    ======================================================
    CONFIGURAR
    ======================================================
    */

    configure(durationMinutes = 0) {

        const minutes =
            Number(durationMinutes);


        if (
            !Number.isFinite(minutes) ||
            minutes <= 0
        ) {

            throw new Error(
                "A duração da prova deve ser maior que zero."
            );

        }


        this.stop();


        this.totalSeconds =
            Math.floor(
                minutes * 60
            );


        this.remainingSeconds =
            this.totalSeconds;


        this.endTime = null;

        this.expired = false;
        this.paused = false;


        return this.remainingSeconds;

    }


    /*
    ======================================================
    INICIAR
    ======================================================
    */

    start() {

        if (
            this.totalSeconds <= 0
        ) {

            throw new Error(
                "ExamTimer não foi configurado."
            );

        }


        /*
        Evita múltiplos intervals.
        */

        this.clearInterval();


        this.running = true;
        this.paused = false;
        this.expired = false;


        /*
        Calculamos o horário real de término.
        */

        this.endTime =
            Date.now() +
            (
                this.remainingSeconds *
                1000
            );


        /*
        Atualização imediata.
        */

        this.update();


        this.intervalId =
            window.setInterval(
                () => {

                    this.update();

                },
                1000
            );


        return true;

    }


    /*
    ======================================================
    ATUALIZAR
    ======================================================
    */

    update() {

        if (
            !this.running ||
            this.paused
        ) {

            return;

        }


        if (!this.endTime) {
            return;
        }


        const milliseconds =
            this.endTime -
            Date.now();


        this.remainingSeconds =
            Math.max(
                0,
                Math.ceil(
                    milliseconds / 1000
                )
            );


        /*
        Callback visual.
        */

        if (
            typeof this.onTick ===
            "function"
        ) {

            this.onTick(
                this.getState()
            );

        }


        /*
        Evento global.
        */

        this.dispatchTickEvent();


        /*
        Tempo acabou.
        */

        if (
            this.remainingSeconds <= 0
        ) {

            this.expire();

        }

    }


    /*
    ======================================================
    PAUSAR
    ======================================================
    */

    pause() {

        if (
            !this.running ||
            this.paused
        ) {

            return false;

        }


        /*
        Atualiza antes de pausar para preservar
        o valor real do tempo restante.
        */

        this.update();


        this.paused = true;
        this.running = false;


        this.clearInterval();


        this.endTime = null;


        this.dispatchStateEvent(
            "paused"
        );


        return true;

    }


    /*
    ======================================================
    CONTINUAR
    ======================================================
    */

    resume() {

        if (
            !this.paused ||
            this.expired ||
            this.remainingSeconds <= 0
        ) {

            return false;

        }


        this.paused = false;


        return this.start();

    }


    /*
    ======================================================
    PARAR
    ======================================================
    */

    stop() {

        this.clearInterval();


        this.running = false;
        this.paused = false;

        this.endTime = null;


        return true;

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    reset() {

        this.stop();


        this.remainingSeconds =
            this.totalSeconds;


        this.expired = false;


        this.dispatchStateEvent(
            "reset"
        );

    }


    /*
    ======================================================
    EXPIRAR
    ======================================================
    */

    expire() {

        /*
        Garante que o evento seja executado
        somente uma vez.
        */

        if (this.expired) {
            return;
        }


        this.expired = true;

        this.remainingSeconds = 0;


        this.clearInterval();


        this.running = false;
        this.paused = false;

        this.endTime = null;


        /*
        Último tick para garantir 00:00:00.
        */

        if (
            typeof this.onTick ===
            "function"
        ) {

            this.onTick(
                this.getState()
            );

        }


        /*
        Callback.
        */

        if (
            typeof this.onExpire ===
            "function"
        ) {

            this.onExpire(
                this.getState()
            );

        }


        /*
        Evento global.

        Quem decide COMO finalizar a prova
        será o ExamEngine/ExamUI.

        O timer apenas informa que acabou.
        */

        document.dispatchEvent(
            new CustomEvent(
                "exam:timerExpired",
                {
                    detail:
                        this.getState()
                }
            )
        );


        this.dispatchStateEvent(
            "expired"
        );

    }


    /*
    ======================================================
    DEFINIR CALLBACK DE TICK
    ======================================================
    */

    setOnTick(callback) {

        this.onTick =
            typeof callback ===
            "function"
                ? callback
                : null;


        return this;

    }


    /*
    ======================================================
    DEFINIR CALLBACK DE EXPIRAÇÃO
    ======================================================
    */

    setOnExpire(callback) {

        this.onExpire =
            typeof callback ===
            "function"
                ? callback
                : null;


        return this;

    }


    /*
    ======================================================
    TEMPO RESTANTE
    ======================================================
    */

    getRemainingSeconds() {

        /*
        Se estiver rodando, sincronizamos
        antes de retornar.
        */

        if (
            this.running &&
            this.endTime
        ) {

            const milliseconds =
                this.endTime -
                Date.now();


            return Math.max(
                0,
                Math.ceil(
                    milliseconds / 1000
                )
            );

        }


        return this.remainingSeconds;

    }


    /*
    ======================================================
    TEMPO DECORRIDO
    ======================================================
    */

    getElapsedSeconds() {

        return Math.max(
            0,
            this.totalSeconds -
            this.getRemainingSeconds()
        );

    }


    /*
    ======================================================
    PERCENTUAL DE TEMPO
    ======================================================
    */

    getProgressPercentage() {

        if (
            this.totalSeconds <= 0
        ) {

            return 0;

        }


        const elapsed =
            this.getElapsedSeconds();


        return Math.min(
            100,
            Math.max(
                0,
                (
                    elapsed /
                    this.totalSeconds
                ) * 100
            )
        );

    }


    /*
    ======================================================
    TEMPO CRÍTICO
    ======================================================
    */

    isWarning() {

        const remaining =
            this.getRemainingSeconds();


        /*
        10 minutos ou menos.
        */

        return (
            remaining > 300 &&
            remaining <= 600
        );

    }


    isCritical() {

        const remaining =
            this.getRemainingSeconds();


        /*
        5 minutos ou menos.
        */

        return (
            remaining > 0 &&
            remaining <= 300
        );

    }


    /*
    ======================================================
    FORMATAR TEMPO
    ======================================================
    */

    format(
        seconds =
            this.getRemainingSeconds()
    ) {

        const value =
            Math.max(
                0,
                Math.floor(
                    Number(seconds) || 0
                )
            );


        const hours =
            Math.floor(
                value / 3600
            );


        const minutes =
            Math.floor(
                (
                    value % 3600
                ) / 60
            );


        const remaining =
            value % 60;


        return (
            String(hours)
                .padStart(2, "0")
            +
            ":"
            +
            String(minutes)
                .padStart(2, "0")
            +
            ":"
            +
            String(remaining)
                .padStart(2, "0")
        );

    }


    /*
    ======================================================
    ESTADO COMPLETO
    ======================================================
    */

    getState() {

        const remaining =
            this.getRemainingSeconds();


        return {

            totalSeconds:
                this.totalSeconds,

            remainingSeconds:
                remaining,

            elapsedSeconds:
                Math.max(
                    0,
                    this.totalSeconds -
                    remaining
                ),

            formatted:
                this.format(
                    remaining
                ),

            running:
                this.running,

            paused:
                this.paused,

            expired:
                this.expired,

            warning:
                this.isWarning(),

            critical:
                this.isCritical(),

            progress:
                this.getProgressPercentage()

        };

    }


    /*
    ======================================================
    EVENTO DE TICK
    ======================================================
    */

    dispatchTickEvent() {

        document.dispatchEvent(
            new CustomEvent(
                "exam:timerTick",
                {
                    detail:
                        this.getState()
                }
            )
        );

    }


    /*
    ======================================================
    EVENTO DE ESTADO
    ======================================================
    */

    dispatchStateEvent(state) {

        document.dispatchEvent(
            new CustomEvent(
                "exam:timerStateChanged",
                {
                    detail: {

                        state,

                        timer:
                            this.getState()

                    }
                }
            )
        );

    }


    /*
    ======================================================
    LIMPAR INTERVAL
    ======================================================
    */

    clearInterval() {

        if (
            this.intervalId !== null
        ) {

            window.clearInterval(
                this.intervalId
            );


            this.intervalId = null;

        }

    }


    /*
    ======================================================
    RESTAURAR ESTADO
    ======================================================

    Preparação para recuperação da prova
    através do StorageManager.

    ======================================================
    */

    restore(state = {}) {

        this.stop();


        this.totalSeconds =
            Math.max(
                0,
                Number(
                    state.totalSeconds
                ) || 0
            );


        this.remainingSeconds =
            Math.max(
                0,
                Number(
                    state.remainingSeconds
                ) || 0
            );


        this.expired =
            Boolean(
                state.expired
            );


        this.paused =
            Boolean(
                state.paused
            );


        /*
        Não iniciamos automaticamente.

        O ExamEngine decidirá se a prova
        restaurada deve continuar.
        */

        this.running = false;

        this.endTime = null;


        return this.getState();

    }


    /*
    ======================================================
    SERIALIZAÇÃO
    ======================================================
    */

    toJSON() {

        return {

            totalSeconds:
                this.totalSeconds,

            remainingSeconds:
                this.getRemainingSeconds(),

            expired:
                this.expired,

            paused:
                this.paused

        };

    }


    /*
    ======================================================
    DESTRUIR
    ======================================================
    */

    destroy() {

        this.stop();

        this.onTick = null;
        this.onExpire = null;

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamTimer =
    ExamTimer;
