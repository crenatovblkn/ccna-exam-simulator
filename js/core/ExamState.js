/*
==========================================================
CCNA Exam Simulator
Exam State

Arquivo: js/core/ExamState.js
==========================================================
*/

class ExamState {

    constructor() {

        this.reset();

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    reset() {

        this.currentIndex = 0;

        this.started = false;
        this.finished = false;

        this.startTime = null;
        this.finishTime = null;

        this.questionCount = 0;

        this.answeredQuestions =
            new Set();

        this.reviewQuestions =
            new Set();

        this.visitedQuestions =
            new Set();

    }


    /*
    ======================================================
    INICIAR PROVA
    ======================================================
    */

    start(questionCount = 0) {

        this.reset();

        this.questionCount =
            Math.max(
                0,
                Number(questionCount) || 0
            );

        this.started = true;

        this.startTime =
            Date.now();

        if (
            this.questionCount > 0
        ) {

            this.visit(0);

        }

        this.dispatchChange(
            "started"
        );

        return this.getState();

    }


    /*
    ======================================================
    FINALIZAR PROVA
    ======================================================
    */

    finish() {

        if (!this.started) {

            return false;

        }

        if (this.finished) {

            return false;

        }

        this.finished = true;

        this.finishTime =
            Date.now();

        this.dispatchChange(
            "finished"
        );

        return true;

    }


    /*
    ======================================================
    QUESTÃO ATUAL
    ======================================================
    */

    setCurrentIndex(index) {

        const target =
            Number(index);

        if (
            !Number.isInteger(target)
        ) {

            return false;

        }

        if (
            target < 0 ||
            target >= this.questionCount
        ) {

            return false;

        }

        this.currentIndex =
            target;

        this.visit(target);

        this.dispatchChange(
            "navigation"
        );

        return true;

    }


    getCurrentIndex() {

        return this.currentIndex;

    }


    /*
    ======================================================
    PRÓXIMA
    ======================================================
    */

    next() {

        if (!this.hasNext()) {

            return false;

        }

        return this.setCurrentIndex(
            this.currentIndex + 1
        );

    }


    /*
    ======================================================
    ANTERIOR
    ======================================================
    */

    previous() {

        if (!this.hasPrevious()) {

            return false;

        }

        return this.setCurrentIndex(
            this.currentIndex - 1
        );

    }


    hasNext() {

        return (
            this.currentIndex <
            this.questionCount - 1
        );

    }


    hasPrevious() {

        return (
            this.currentIndex > 0
        );

    }


    /*
    ======================================================
    RESPONDIDA
    ======================================================
    */

    setAnswered(
        index,
        answered = true
    ) {

        if (
            !this.isValidIndex(index)
        ) {

            return false;

        }

        index =
            Number(index);

        if (answered) {

            this.answeredQuestions.add(
                index
            );

        } else {

            this.answeredQuestions.delete(
                index
            );

        }

        this.dispatchChange(
            "answer"
        );

        return true;

    }


    isAnswered(index) {

        return this.answeredQuestions.has(
            Number(index)
        );

    }


    /*
    ======================================================
    REVISÃO
    ======================================================
    */

    setReview(
        index,
        review = true
    ) {

        if (
            !this.isValidIndex(index)
        ) {

            return false;

        }

        index =
            Number(index);

        if (review) {

            this.reviewQuestions.add(
                index
            );

        } else {

            this.reviewQuestions.delete(
                index
            );

        }

        this.dispatchChange(
            "review"
        );

        return true;

    }


    toggleReview(index) {

        if (
            !this.isValidIndex(index)
        ) {

            return false;

        }

        index =
            Number(index);

        const value =
            !this.reviewQuestions.has(
                index
            );

        this.setReview(
            index,
            value
        );

        return value;

    }


    isMarkedForReview(index) {

        return this.reviewQuestions.has(
            Number(index)
        );

    }


    /*
    ======================================================
    VISITADA
    ======================================================
    */

    visit(index) {

        if (
            !this.isValidIndex(index)
        ) {

            return false;

        }

        this.visitedQuestions.add(
            Number(index)
        );

        return true;

    }


    wasVisited(index) {

        return this.visitedQuestions.has(
            Number(index)
        );

    }


    /*
    ======================================================
    CONTADORES
    ======================================================
    */

    getAnsweredCount() {

        return this.answeredQuestions.size;

    }


    getReviewCount() {

        return this.reviewQuestions.size;

    }


    getVisitedCount() {

        return this.visitedQuestions.size;

    }


    getUnansweredCount() {

        return Math.max(
            0,
            this.questionCount -
            this.answeredQuestions.size
        );

    }


    /*
    ======================================================
    PROGRESSO
    ======================================================
    */

    getProgressPercentage() {

        if (
            this.questionCount <= 0
        ) {

            return 0;

        }

        return (
            this.answeredQuestions.size /
            this.questionCount
        ) * 100;

    }


    /*
    ======================================================
    TEMPO DECORRIDO
    ======================================================
    */

    getElapsedMilliseconds() {

        if (!this.startTime) {

            return 0;

        }

        const end =
            this.finishTime ||
            Date.now();

        return Math.max(
            0,
            end - this.startTime
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
    VALIDAR ÍNDICE
    ======================================================
    */

    isValidIndex(index) {

        const value =
            Number(index);

        return (
            Number.isInteger(value) &&
            value >= 0 &&
            value < this.questionCount
        );

    }


    /*
    ======================================================
    ESTADO COMPLETO
    ======================================================
    */

    getState() {

        return {

            currentIndex:
                this.currentIndex,

            questionCount:
                this.questionCount,

            started:
                this.started,

            finished:
                this.finished,

            startTime:
                this.startTime,

            finishTime:
                this.finishTime,

            answered:
                Array.from(
                    this.answeredQuestions
                ),

            review:
                Array.from(
                    this.reviewQuestions
                ),

            visited:
                Array.from(
                    this.visitedQuestions
                ),

            answeredCount:
                this.getAnsweredCount(),

            unansweredCount:
                this.getUnansweredCount(),

            reviewCount:
                this.getReviewCount(),

            visitedCount:
                this.getVisitedCount(),

            progress:
                this.getProgressPercentage(),

            elapsedSeconds:
                this.getElapsedSeconds()

        };

    }


    /*
    ======================================================
    RESTAURAR ESTADO
    ======================================================
    */

    restore(data = {}) {

        this.reset();

        this.currentIndex =
            Number(data.currentIndex) || 0;

        this.questionCount =
            Math.max(
                0,
                Number(data.questionCount) || 0
            );

        this.started =
            Boolean(data.started);

        this.finished =
            Boolean(data.finished);

        this.startTime =
            data.startTime || null;

        this.finishTime =
            data.finishTime || null;

        this.answeredQuestions =
            new Set(
                Array.isArray(data.answered)
                    ? data.answered.map(Number)
                    : []
            );

        this.reviewQuestions =
            new Set(
                Array.isArray(data.review)
                    ? data.review.map(Number)
                    : []
            );

        this.visitedQuestions =
            new Set(
                Array.isArray(data.visited)
                    ? data.visited.map(Number)
                    : []
            );


        /*
        Proteção contra índice inválido
        em dados restaurados.
        */

        if (
            this.questionCount > 0
        ) {

            this.currentIndex =
                Math.min(
                    Math.max(
                        0,
                        this.currentIndex
                    ),
                    this.questionCount - 1
                );

        } else {

            this.currentIndex = 0;

        }


        this.dispatchChange(
            "restored"
        );

        return this.getState();

    }


    /*
    ======================================================
    SERIALIZAÇÃO
    ======================================================
    */

    toJSON() {

        return this.getState();

    }


    /*
    ======================================================
    EVENTO
    ======================================================
    */

    dispatchChange(type) {

        document.dispatchEvent(

            new CustomEvent(
                "exam:stateChanged",
                {
                    detail: {

                        type,

                        state:
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

window.ExamState =
    ExamState;
