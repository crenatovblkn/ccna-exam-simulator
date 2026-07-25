/*
==========================================================
CCNA Exam Simulator
Exam Session

Arquivo: js/core/ExamSession.js
==========================================================
*/

class ExamSession {

    constructor(data = {}) {

        this.id =
            data.id ||
            this.generateId();

        this.domainId =
            data.domainId ||
            "";

        this.modeId =
            data.modeId ||
            "";

        this.questionCount =
            Number(
                data.questionCount
            ) || 0;

        this.durationMinutes =
            Number(
                data.durationMinutes
            ) || 0;

        /*
        IDs das questões selecionadas
        para esta tentativa.
        */

        this.questionIds =
            Array.isArray(
                data.questionIds
            )
                ? data.questionIds.map(String)
                : [];

        /*
        Datas armazenadas como timestamp.
        */

        this.createdAt =
            data.createdAt ||
            Date.now();

        this.startedAt =
            data.startedAt ||
            null;

        this.finishedAt =
            data.finishedAt ||
            null;

        /*
        Estados possíveis:

        created
        running
        finished
        expired
        abandoned
        */

        this.status =
            data.status ||
            "created";

        /*
        Motivo da finalização.

        manual
        timer
        null
        */

        this.finishReason =
            data.finishReason ||
            null;

    }


    /*
    ======================================================
    GERAR ID DA SESSÃO
    ======================================================
    */

    generateId() {

        const timestamp =
            Date.now()
                .toString(36);

        const random =
            Math.random()
                .toString(36)
                .substring(2, 10);

        return (
            `exam-${timestamp}-${random}`
        );

    }


    /*
    ======================================================
    CONFIGURAR SESSÃO
    ======================================================
    */

    configure({
        domainId = "",
        modeId = "",
        questionCount = 0,
        durationMinutes = 0,
        questionIds = []
    } = {}) {

        this.domainId =
            String(domainId);

        this.modeId =
            String(modeId);

        this.questionCount =
            Math.max(
                0,
                Number(questionCount) || 0
            );

        this.durationMinutes =
            Math.max(
                0,
                Number(durationMinutes) || 0
            );

        this.questionIds =
            Array.isArray(questionIds)
                ? questionIds.map(String)
                : [];

        return this;

    }


    /*
    ======================================================
    INICIAR
    ======================================================
    */

    start() {

        if (
            this.status === "running"
        ) {

            return false;

        }

        if (
            this.isFinished()
        ) {

            return false;

        }

        this.startedAt =
            Date.now();

        this.status =
            "running";

        this.finishReason =
            null;

        this.dispatchEvent(
            "started"
        );

        return true;

    }


    /*
    ======================================================
    FINALIZAR MANUALMENTE
    ======================================================
    */

    finish() {

        return this.complete(
            "finished",
            "manual"
        );

    }


    /*
    ======================================================
    FINALIZAR POR TEMPO
    ======================================================
    */

    expire() {

        return this.complete(
            "expired",
            "timer"
        );

    }


    /*
    ======================================================
    FINALIZAÇÃO INTERNA
    ======================================================
    */

    complete(
        status,
        reason
    ) {

        if (
            this.isFinished()
        ) {

            return false;

        }

        this.finishedAt =
            Date.now();

        this.status =
            status;

        this.finishReason =
            reason;

        this.dispatchEvent(
            status
        );

        return true;

    }


    /*
    ======================================================
    ABANDONAR SESSÃO
    ======================================================
    */

    abandon() {

        if (
            this.isFinished()
        ) {

            return false;

        }

        this.finishedAt =
            Date.now();

        this.status =
            "abandoned";

        this.finishReason =
            "abandoned";

        this.dispatchEvent(
            "abandoned"
        );

        return true;

    }


    /*
    ======================================================
    STATUS
    ======================================================
    */

    isCreated() {

        return (
            this.status ===
            "created"
        );

    }


    isRunning() {

        return (
            this.status ===
            "running"
        );

    }


    isExpired() {

        return (
            this.status ===
            "expired"
        );

    }


    isAbandoned() {

        return (
            this.status ===
            "abandoned"
        );

    }


    isFinished() {

        return (
            this.status === "finished" ||
            this.status === "expired" ||
            this.status === "abandoned"
        );

    }


    /*
    ======================================================
    TEMPO DECORRIDO
    ======================================================
    */

    getElapsedMilliseconds() {

        if (!this.startedAt) {

            return 0;

        }

        const end =
            this.finishedAt ||
            Date.now();

        return Math.max(
            0,
            end -
            this.startedAt
        );

    }


    getElapsedSeconds() {

        return Math.floor(
            this.getElapsedMilliseconds() /
            1000
        );

    }


    /*
    ======================================================
    QUESTÕES DA SESSÃO
    ======================================================
    */

    setQuestionIds(
        questionIds = []
    ) {

        if (
            !Array.isArray(
                questionIds
            )
        ) {

            return false;

        }

        this.questionIds =
            questionIds.map(String);

        this.questionCount =
            this.questionIds.length;

        return true;

    }


    getQuestionIds() {

        return [
            ...this.questionIds
        ];

    }


    hasQuestion(
        questionId
    ) {

        return this.questionIds.includes(
            String(questionId)
        );

    }


    /*
    ======================================================
    INFORMAÇÕES DA SESSÃO
    ======================================================
    */

    getId() {

        return this.id;

    }


    getStatus() {

        return this.status;

    }


    getFinishReason() {

        return this.finishReason;

    }


    /*
    ======================================================
    ESTADO COMPLETO
    ======================================================
    */

    getState() {

        return {

            id:
                this.id,

            domainId:
                this.domainId,

            modeId:
                this.modeId,

            questionCount:
                this.questionCount,

            durationMinutes:
                this.durationMinutes,

            questionIds:
                [...this.questionIds],

            createdAt:
                this.createdAt,

            startedAt:
                this.startedAt,

            finishedAt:
                this.finishedAt,

            status:
                this.status,

            finishReason:
                this.finishReason,

            elapsedSeconds:
                this.getElapsedSeconds()

        };

    }


    /*
    ======================================================
    SERIALIZAÇÃO
    ======================================================
    */

    toJSON() {

        return {

            id:
                this.id,

            domainId:
                this.domainId,

            modeId:
                this.modeId,

            questionCount:
                this.questionCount,

            durationMinutes:
                this.durationMinutes,

            questionIds:
                [...this.questionIds],

            createdAt:
                this.createdAt,

            startedAt:
                this.startedAt,

            finishedAt:
                this.finishedAt,

            status:
                this.status,

            finishReason:
                this.finishReason

        };

    }


    /*
    ======================================================
    RESTAURAR
    ======================================================
    */

    restore(
        data = {}
    ) {

        if (!data.id) {

            return false;

        }

        this.id =
            String(data.id);

        this.domainId =
            String(
                data.domainId ||
                ""
            );

        this.modeId =
            String(
                data.modeId ||
                ""
            );

        this.questionCount =
            Math.max(
                0,
                Number(
                    data.questionCount
                ) || 0
            );

        this.durationMinutes =
            Math.max(
                0,
                Number(
                    data.durationMinutes
                ) || 0
            );

        this.questionIds =
            Array.isArray(
                data.questionIds
            )
                ? data.questionIds.map(String)
                : [];

        this.createdAt =
            data.createdAt ||
            Date.now();

        this.startedAt =
            data.startedAt ||
            null;

        this.finishedAt =
            data.finishedAt ||
            null;

        this.status =
            data.status ||
            "created";

        this.finishReason =
            data.finishReason ||
            null;

        return true;

    }


    /*
    ======================================================
    CRIAR A PARTIR DE JSON
    ======================================================
    */

    static fromJSON(
        data = {}
    ) {

        return new ExamSession(
            data
        );

    }


    /*
    ======================================================
    EVENTO
    ======================================================
    */

    dispatchEvent(type) {

        document.dispatchEvent(

            new CustomEvent(
                "exam:sessionChanged",
                {
                    detail: {

                        type,

                        session:
                            this.getState()

                    }
                }
            )

        );

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamSession =
    ExamSession;
