/*
==========================================================
CCNA Exam Simulator
Exam Event Bus

Arquivo: js/core/ExamEventBus.js
==========================================================
*/

class ExamEventBus {

    constructor() {

        this.listeners = new Map();

    }


    /*
    ======================================================
    REGISTRAR EVENTO
    ======================================================
    */

    on(eventName, callback) {

        if (
            typeof eventName !== "string" ||
            typeof callback !== "function"
        ) {

            return false;

        }


        if (
            !this.listeners.has(eventName)
        ) {

            this.listeners.set(
                eventName,
                new Set()
            );

        }


        this.listeners
            .get(eventName)
            .add(callback);


        return true;

    }


    /*
    ======================================================
    REGISTRAR EVENTO UMA ÚNICA VEZ
    ======================================================
    */

    once(eventName, callback) {

        if (
            typeof callback !== "function"
        ) {

            return false;

        }


        const wrapper = data => {

            this.off(
                eventName,
                wrapper
            );


            callback(data);

        };


        return this.on(
            eventName,
            wrapper
        );

    }


    /*
    ======================================================
    REMOVER EVENTO
    ======================================================
    */

    off(eventName, callback) {

        if (
            !this.listeners.has(eventName)
        ) {

            return false;

        }


        const callbacks =
            this.listeners.get(eventName);


        callbacks.delete(callback);


        if (
            callbacks.size === 0
        ) {

            this.listeners.delete(
                eventName
            );

        }


        return true;

    }


    /*
    ======================================================
    DISPARAR EVENTO
    ======================================================
    */

    emit(eventName, data = null) {

        if (
            !this.listeners.has(eventName)
        ) {

            return false;

        }


        const callbacks =
            Array.from(
                this.listeners.get(eventName)
            );


        callbacks.forEach(callback => {

            try {

                callback(data);

            } catch (error) {

                console.error(
                    `[ExamEventBus] Erro no evento "${eventName}":`,
                    error
                );

            }

        });


        return true;

    }


    /*
    ======================================================
    REMOVER TODOS OS LISTENERS DE UM EVENTO
    ======================================================
    */

    clear(eventName = null) {

        if (eventName) {

            this.listeners.delete(
                eventName
            );


            return;

        }


        this.listeners.clear();

    }


    /*
    ======================================================
    VERIFICAR SE EXISTEM LISTENERS
    ======================================================
    */

    has(eventName) {

        return (
            this.listeners.has(eventName) &&
            this.listeners.get(eventName).size > 0
        );

    }


    /*
    ======================================================
    QUANTIDADE DE LISTENERS
    ======================================================
    */

    count(eventName) {

        if (
            !this.listeners.has(eventName)
        ) {

            return 0;

        }


        return this.listeners
            .get(eventName)
            .size;

    }

}


/*
==========================================================
EVENTOS PADRÃO DO SIMULADOR

Usamos constantes para evitar erros como:

"exam:finish"
"exam:finished"
"exam:finised"

==========================================================
*/

const ExamEvents = Object.freeze({

    /*
    ------------------------------------------------------
    APLICAÇÃO
    ------------------------------------------------------
    */

    APP_READY:
        "app:ready",

    APP_ERROR:
        "app:error",


    /*
    ------------------------------------------------------
    BANCO DE QUESTÕES
    ------------------------------------------------------
    */

    BANK_LOADING:
        "bank:loading",

    BANK_LOADED:
        "bank:loaded",

    BANK_ERROR:
        "bank:error",

    BANK_VALIDATED:
        "bank:validated",


    /*
    ------------------------------------------------------
    PROVA
    ------------------------------------------------------
    */

    EXAM_STARTING:
        "exam:starting",

    EXAM_STARTED:
        "exam:started",

    EXAM_FINISHING:
        "exam:finishing",

    EXAM_FINISHED:
        "exam:finished",

    EXAM_RESET:
        "exam:reset",


    /*
    ------------------------------------------------------
    QUESTÕES
    ------------------------------------------------------
    */

    QUESTION_CHANGED:
        "question:changed",

    QUESTION_ANSWERED:
        "question:answered",

    QUESTION_CLEARED:
        "question:cleared",

    QUESTION_REVIEW_CHANGED:
        "question:review-changed",

    QUESTION_VISITED:
        "question:visited",


    /*
    ------------------------------------------------------
    NAVEGAÇÃO
    ------------------------------------------------------
    */

    NAVIGATION_NEXT:
        "navigation:next",

    NAVIGATION_PREVIOUS:
        "navigation:previous",

    NAVIGATION_GOTO:
        "navigation:goto",


    /*
    ------------------------------------------------------
    TIMER
    ------------------------------------------------------
    */

    TIMER_STARTED:
        "timer:started",

    TIMER_TICK:
        "timer:tick",

    TIMER_WARNING:
        "timer:warning",

    TIMER_CRITICAL:
        "timer:critical",

    TIMER_EXPIRED:
        "timer:expired",

    TIMER_STOPPED:
        "timer:stopped",


    /*
    ------------------------------------------------------
    STORAGE
    ------------------------------------------------------
    */

    STATE_SAVED:
        "state:saved",

    STATE_RESTORED:
        "state:restored",

    STATE_CLEARED:
        "state:cleared",


    /*
    ------------------------------------------------------
    RESULTADO
    ------------------------------------------------------
    */

    RESULT_READY:
        "result:ready",

    REVIEW_OPENED:
        "review:opened",

    REVIEW_CLOSED:
        "review:closed"

});


/*
==========================================================
INSTÂNCIA GLOBAL

Todos os componentes utilizarão a mesma instância.
==========================================================
*/

const examEventBus =
    new ExamEventBus();


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamEventBus =
    ExamEventBus;

window.ExamEvents =
    ExamEvents;

window.examEventBus =
    examEventBus;
