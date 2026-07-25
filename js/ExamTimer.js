/*
==========================================================
CCNA Exam Simulator
Exam Timer

Arquivo: js/ExamTimer.js
==========================================================
*/

class ExamTimer {

    constructor(element, examSession) {

        if (!element) {
            throw new Error(
                "ExamTimer precisa de um elemento para exibir o tempo."
            );
        }

        if (!examSession) {
            throw new Error(
                "ExamTimer precisa de uma ExamSession."
            );
        }

        this.element = element;
        this.examSession = examSession;

        this.interval = null;

        this.running = false;
        this.expired = false;

        this.warningSeconds = 600;
        this.criticalSeconds = 300;

        this.handleVisibilityChange =
            this.handleVisibilityChange.bind(this);

        document.addEventListener(
            "visibilitychange",
            this.handleVisibilityChange
        );

    }


    /*
    ======================================================
    INICIAR TIMER
    ======================================================
    */

    start() {

        this.stop();

        this.expired = false;

        const remaining =
            this.examSession.getRemainingSeconds();

        /*
        Se a prova não possui limite de tempo,
        mostramos apenas o tempo decorrido.
        */

        if (remaining === null) {

            this.running = true;

            this.renderElapsed();

            this.interval = setInterval(
                () => {
                    this.renderElapsed();
                },
                1000
            );

            return;
        }


        /*
        Se o tempo já terminou.
        */

        if (remaining <= 0) {

            this.render(0);
            this.handleExpiration();

            return;
        }


        this.running = true;

        this.render(remaining);


        this.interval = setInterval(
            () => {

                this.tick();

            },
            1000
        );

    }


    /*
    ======================================================
    TICK
    ======================================================
    */

    tick() {

        if (!this.running) {
            return;
        }


        if (
            this.examSession.isFinished()
        ) {

            this.stop();
            return;

        }


        const remaining =
            this.examSession.getRemainingSeconds();


        /*
        Prova sem limite.
        */

        if (remaining === null) {

            this.renderElapsed();
            return;

        }


        this.render(remaining);


        if (remaining <= 0) {

            this.handleExpiration();

        }

    }


    /*
    ======================================================
    RENDERIZAR CONTAGEM REGRESSIVA
    ======================================================
    */

    render(seconds) {

        const safeSeconds =
            Math.max(
                0,
                Number(seconds) || 0
            );


        this.element.textContent =
            this.formatTime(
                safeSeconds
            );


        /*
        Remove estados anteriores.
        */

        this.element.classList.remove(
            "timer-warning",
            "timer-critical",
            "timer-expired"
        );


        /*
        Tempo esgotado.
        */

        if (safeSeconds <= 0) {

            this.element.classList.add(
                "timer-expired"
            );

            return;

        }


        /*
        Últimos 5 minutos.
        */

        if (
            safeSeconds <=
            this.criticalSeconds
        ) {

            this.element.classList.add(
                "timer-critical"
            );

            return;

        }


        /*
        Últimos 10 minutos.
        */

        if (
            safeSeconds <=
            this.warningSeconds
        ) {

            this.element.classList.add(
                "timer-warning"
            );

        }

    }


    /*
    ======================================================
    RENDERIZAR TEMPO DECORRIDO
    ======================================================
    */

    renderElapsed() {

        const elapsed =
            this.examSession.getElapsedSeconds();


        this.element.textContent =
            this.formatTime(
                elapsed
            );


        this.element.classList.remove(
            "timer-warning",
            "timer-critical",
            "timer-expired"
        );

    }


    /*
    ======================================================
    FORMATAR TEMPO
    ======================================================
    */

    formatTime(totalSeconds) {

        const seconds =
            Math.max(
                0,
                Math.floor(
                    Number(totalSeconds) || 0
                )
            );


        const hours =
            Math.floor(
                seconds / 3600
            );


        const minutes =
            Math.floor(
                (seconds % 3600) / 60
            );


        const remainingSeconds =
            seconds % 60;


        const formattedHours =
            String(hours)
                .padStart(
                    2,
                    "0"
                );


        const formattedMinutes =
            String(minutes)
                .padStart(
                    2,
                    "0"
                );


        const formattedSeconds =
            String(remainingSeconds)
                .padStart(
                    2,
                    "0"
                );


        /*
        Sempre utilizamos HH:MM:SS.
        Isso evita mudança visual quando
        uma prova passa de 59 para 60 minutos.
        */

        return (
            `${formattedHours}:` +
            `${formattedMinutes}:` +
            `${formattedSeconds}`
        );

    }


    /*
    ======================================================
    TEMPO ESGOTADO
    ======================================================
    */

    handleExpiration() {

        /*
        Impede múltiplos disparos.
        */

        if (this.expired) {
            return;
        }


        this.expired = true;

        this.running = false;


        if (this.interval) {

            clearInterval(
                this.interval
            );

            this.interval = null;

        }


        this.render(0);


        /*
        IMPORTANTE:

        O timer NÃO chama finish() diretamente.

        O controlador principal receberá
        este evento e será responsável
        pelo encerramento completo da prova.
        */

        const event =
            new CustomEvent(
                "exam:timeExpired",
                {
                    detail: {

                        elapsedSeconds:
                            this.examSession
                                .getElapsedSeconds(),

                        progress:
                            this.examSession
                                .getProgress()

                    }
                }
            );


        document.dispatchEvent(
            event
        );

    }


    /*
    ======================================================
    PARAR TIMER
    ======================================================
    */

    stop() {

        if (this.interval) {

            clearInterval(
                this.interval
            );

            this.interval = null;

        }


        this.running = false;

    }


    /*
    ======================================================
    REINICIAR
    ======================================================
    */

    restart() {

        this.stop();

        this.expired = false;

        this.start();

    }


    /*
    ======================================================
    VERIFICAR SE ESTÁ RODANDO
    ======================================================
    */

    isRunning() {

        return this.running;

    }


    /*
    ======================================================
    SINCRONIZAR TIMER
    ======================================================
    */

    sync() {

        if (
            !this.examSession.isStarted()
        ) {

            return;
        }


        if (
            this.examSession.isFinished()
        ) {

            this.stop();
            return;
        }


        const remaining =
            this.examSession
                .getRemainingSeconds();


        if (remaining === null) {

            this.renderElapsed();
            return;

        }


        this.render(remaining);


        if (remaining <= 0) {

            this.handleExpiration();

        }

    }


    /*
    ======================================================
    ABA DO NAVEGADOR
    ======================================================

    setInterval pode sofrer redução de frequência
    quando a aba fica em segundo plano.

    O ExamSession calcula o tempo utilizando
    Date.now(), então ao retornar para a aba
    fazemos uma nova sincronização.
    ======================================================
    */

    handleVisibilityChange() {

        if (
            document.visibilityState ===
            "visible"
        ) {

            this.sync();

        }

    }


    /*
    ======================================================
    DESTRUIR
    ======================================================
    */

    destroy() {

        this.stop();


        document.removeEventListener(
            "visibilitychange",
            this.handleVisibilityChange
        );


        this.element.classList.remove(
            "timer-warning",
            "timer-critical",
            "timer-expired"
        );

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamTimer = ExamTimer;
