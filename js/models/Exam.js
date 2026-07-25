/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
Exam Model

Responsabilidade:
- Representar uma sessão de exame
- Gerenciar questões selecionadas
- Controlar questão atual
- Controlar tempo
- Calcular estatísticas
- Finalizar o exame
- Calcular resultado
- Serializar/restaurar sessão

Este modelo NÃO manipula DOM.
==========================================================
*/

class Exam {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor(data = {}) {

        /*
        --------------------------------------------------
        Identificação
        --------------------------------------------------
        */

        this.id =
            data.id ||
            this.generateId();


        /*
        --------------------------------------------------
        Configuração
        --------------------------------------------------
        */

        this.title =
            data.title ||
            "Cisco CCNA 200-301";

        this.domain =
            data.domain ||
            "Network Fundamentals";

        this.mode =
            data.mode ||
            "practice";


        /*
        --------------------------------------------------
        Questões
        --------------------------------------------------
        */

        this.questions =
            Array.isArray(data.questions)
                ? data.questions.map(question => {

                    if (question instanceof Question) {
                        return question;
                    }

                    return new Question(question);

                })
                : [];


        /*
        --------------------------------------------------
        Quantidade
        --------------------------------------------------
        */

        this.totalQuestions =
            this.questions.length;


        /*
        --------------------------------------------------
        Questão atual
        --------------------------------------------------
        */

        this.currentIndex =
            Number.isInteger(data.currentIndex)
                ? data.currentIndex
                : 0;


        /*
        --------------------------------------------------
        Tempo total

        Sempre armazenado em segundos.
        --------------------------------------------------
        */

        this.duration =
            Number.isFinite(data.duration)
                ? Math.max(0, data.duration)
                : 0;


        /*
        --------------------------------------------------
        Tempo restante
        --------------------------------------------------
        */

        this.remainingTime =
            Number.isFinite(data.remainingTime)
                ? Math.max(0, data.remainingTime)
                : this.duration;


        /*
        --------------------------------------------------
        Tempo utilizado
        --------------------------------------------------
        */

        this.elapsedTime =
            Number.isFinite(data.elapsedTime)
                ? Math.max(0, data.elapsedTime)
                : 0;


        /*
        --------------------------------------------------
        Datas
        --------------------------------------------------
        */

        this.startedAt =
            data.startedAt || null;

        this.finishedAt =
            data.finishedAt || null;


        /*
        --------------------------------------------------
        Estado
        --------------------------------------------------
        */

        this.started =
            Boolean(data.started);

        this.finished =
            Boolean(data.finished);

        this.paused =
            Boolean(data.paused);


        /*
        --------------------------------------------------
        Motivo da finalização
        --------------------------------------------------
        */

        this.finishReason =
            data.finishReason || null;


        /*
        --------------------------------------------------
        Resultado
        --------------------------------------------------
        */

        this.result =
            data.result || null;


        /*
        --------------------------------------------------
        Limite do índice
        --------------------------------------------------
        */

        this.normalizeCurrentIndex();

    }


    /*
    ======================================================
    GETTERS
    ======================================================
    */

    getId() {

        return this.id;

    }


    getTitle() {

        return this.title;

    }


    getDomain() {

        return this.domain;

    }


    getMode() {

        return this.mode;

    }


    getQuestions() {

        return this.questions;

    }


    getTotalQuestions() {

        return this.totalQuestions;

    }


    getCurrentIndex() {

        return this.currentIndex;

    }


    getCurrentQuestion() {

        if (
            this.questions.length === 0
        ) {

            return null;

        }


        return (
            this.questions[
                this.currentIndex
            ] || null
        );

    }


    getQuestion(index) {

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.questions.length
        ) {

            return null;

        }


        return this.questions[index];

    }


    getDuration() {

        return this.duration;

    }


    getRemainingTime() {

        return this.remainingTime;

    }


    getElapsedTime() {

        return this.elapsedTime;

    }


    getStartedAt() {

        return this.startedAt;

    }


    getFinishedAt() {

        return this.finishedAt;

    }


    getFinishReason() {

        return this.finishReason;

    }


    getResult() {

        return this.result;

    }


    /*
    ======================================================
    ESTADO
    ======================================================
    */

    isStarted() {

        return this.started;

    }


    isFinished() {

        return this.finished;

    }


    isPaused() {

        return this.paused;

    }


    /*
    ======================================================
    INICIAR EXAME
    ======================================================
    */

    start() {

        if (this.finished) {

            return false;

        }


        if (!this.started) {

            this.started = true;

            this.startedAt =
                new Date().toISOString();

        }


        this.paused = false;


        const question =
            this.getCurrentQuestion();


        if (question) {

            question.visit();

        }


        return true;

    }


    /*
    ======================================================
    PAUSA
    ======================================================
    */

    pause() {

        if (
            !this.started ||
            this.finished
        ) {

            return false;

        }


        this.paused = true;

        return true;

    }


    resume() {

        if (
            !this.started ||
            this.finished
        ) {

            return false;

        }


        this.paused = false;

        return true;

    }


    /*
    ======================================================
    NAVEGAÇÃO
    ======================================================
    */

    goToQuestion(index) {

        if (this.finished) {

            return false;

        }


        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.questions.length
        ) {

            return false;

        }


        this.currentIndex =
            index;


        const question =
            this.getCurrentQuestion();


        if (question) {

            question.visit();

        }


        return true;

    }


    /*
    ======================================================
    PRÓXIMA QUESTÃO
    ======================================================
    */

    nextQuestion() {

        if (
            this.currentIndex >=
            this.questions.length - 1
        ) {

            return false;

        }


        return this.goToQuestion(
            this.currentIndex + 1
        );

    }


    /*
    ======================================================
    QUESTÃO ANTERIOR
    ======================================================
    */

    previousQuestion() {

        if (
            this.currentIndex <= 0
        ) {

            return false;

        }


        return this.goToQuestion(
            this.currentIndex - 1
        );

    }


    /*
    ======================================================
    PRIMEIRA / ÚLTIMA
    ======================================================
    */

    isFirstQuestion() {

        return this.currentIndex === 0;

    }


    isLastQuestion() {

        return (
            this.currentIndex ===
            this.questions.length - 1
        );

    }


    /*
    ======================================================
    TEMPO
    ======================================================
    */

    tick(seconds = 1) {

        if (
            !this.started ||
            this.finished ||
            this.paused
        ) {

            return this.remainingTime;

        }


        seconds =
            Number(seconds);


        if (
            !Number.isFinite(seconds) ||
            seconds <= 0
        ) {

            return this.remainingTime;

        }


        this.elapsedTime += seconds;


        if (this.duration > 0) {

            this.remainingTime =
                Math.max(
                    0,
                    this.remainingTime -
                    seconds
                );


            /*
            ----------------------------------------------
            Tempo encerrado
            ----------------------------------------------
            */

            if (
                this.remainingTime === 0
            ) {

                this.finish(
                    "time-expired"
                );

            }

        }


        return this.remainingTime;

    }


    /*
    ======================================================
    DEFINE TEMPO
    ======================================================
    */

    setRemainingTime(seconds) {

        seconds =
            Number(seconds);


        if (!Number.isFinite(seconds)) {

            return false;

        }


        this.remainingTime =
            Math.max(
                0,
                seconds
            );


        return true;

    }


    /*
    ======================================================
    TEMPO FORMATADO
    ======================================================
    */

    getFormattedRemainingTime() {

        return this.formatTime(
            this.remainingTime
        );

    }


    getFormattedElapsedTime() {

        return this.formatTime(
            this.elapsedTime
        );

    }


    formatTime(totalSeconds) {

        totalSeconds =
            Math.max(
                0,
                Math.floor(
                    Number(totalSeconds) || 0
                )
            );


        const hours =
            Math.floor(
                totalSeconds / 3600
            );


        const minutes =
            Math.floor(
                (totalSeconds % 3600) /
                60
            );


        const seconds =
            totalSeconds % 60;


        const hh =
            String(hours)
                .padStart(2, "0");


        const mm =
            String(minutes)
                .padStart(2, "0");


        const ss =
            String(seconds)
                .padStart(2, "0");


        if (hours > 0) {

            return `${hh}:${mm}:${ss}`;

        }


        return `${mm}:${ss}`;

    }


    /*
    ======================================================
    QUESTÕES RESPONDIDAS
    ======================================================
    */

    getAnsweredQuestions() {

        return this.questions.filter(
            question =>
                question.isAnswered()
        );

    }


    getAnsweredCount() {

        return this
            .getAnsweredQuestions()
            .length;

    }


    /*
    ======================================================
    QUESTÕES NÃO RESPONDIDAS
    ======================================================
    */

    getUnansweredQuestions() {

        return this.questions.filter(
            question =>
                !question.isAnswered()
        );

    }


    getUnansweredCount() {

        return this
            .getUnansweredQuestions()
            .length;

    }


    /*
    ======================================================
    QUESTÕES MARCADAS PARA REVISÃO
    ======================================================
    */

    getReviewQuestions() {

        return this.questions.filter(
            question =>
                question.isMarkedForReview()
        );

    }


    getReviewCount() {

        return this
            .getReviewQuestions()
            .length;

    }


    /*
    ======================================================
    QUESTÕES VISITADAS
    ======================================================
    */

    getVisitedQuestions() {

        return this.questions.filter(
            question =>
                question.wasVisited()
        );

    }


    getVisitedCount() {

        return this
            .getVisitedQuestions()
            .length;

    }


    /*
    ======================================================
    QUESTÕES CORRETAS
    ======================================================
    */

    getCorrectQuestions() {

        return this.questions.filter(
            question =>
                question.isAnswered() &&
                question.isCorrect()
        );

    }


    getCorrectCount() {

        return this
            .getCorrectQuestions()
            .length;

    }


    /*
    ======================================================
    QUESTÕES INCORRETAS
    ======================================================
    */

    getIncorrectQuestions() {

        return this.questions.filter(
            question =>
                question.isAnswered() &&
                !question.isCorrect()
        );

    }


    getIncorrectCount() {

        return this
            .getIncorrectQuestions()
            .length;

    }


    /*
    ======================================================
    PROGRESSO
    ======================================================
    */

    getProgressPercentage() {

        if (
            this.totalQuestions === 0
        ) {

            return 0;

        }


        return Math.round(
            (
                this.getAnsweredCount() /
                this.totalQuestions
            ) * 100
        );

    }


    /*
    ======================================================
    SCORE

    Percentual simples de acertos.

    O simulador não tenta reproduzir o algoritmo
    proprietário de pontuação da Cisco.
    ======================================================
    */

    calculateScore() {

        if (
            this.totalQuestions === 0
        ) {

            return 0;

        }


        return Math.round(
            (
                this.getCorrectCount() /
                this.totalQuestions
            ) * 100
        );

    }


    /*
    ======================================================
    RESULTADO POR DOMÍNIO
    ======================================================
    */

    calculateDomainResults() {

        const domains = {};


        this.questions.forEach(
            question => {

                const domain =
                    question.getDomain() ||
                    "Unknown";


                if (!domains[domain]) {

                    domains[domain] = {

                        domain: domain,

                        total: 0,

                        answered: 0,

                        correct: 0,

                        incorrect: 0,

                        unanswered: 0,

                        percentage: 0

                    };

                }


                const stats =
                    domains[domain];


                stats.total++;


                if (
                    question.isAnswered()
                ) {

                    stats.answered++;


                    if (
                        question.isCorrect()
                    ) {

                        stats.correct++;

                    } else {

                        stats.incorrect++;

                    }

                } else {

                    stats.unanswered++;

                }

            }
        );


        Object.keys(domains)
            .forEach(domain => {

                const stats =
                    domains[domain];


                stats.percentage =
                    stats.total > 0
                        ? Math.round(
                            (
                                stats.correct /
                                stats.total
                            ) * 100
                        )
                        : 0;

            });


        return domains;

    }


    /*
    ======================================================
    ESTATÍSTICAS
    ======================================================
    */

    getStatistics() {

        return {

            total:
                this.totalQuestions,

            answered:
                this.getAnsweredCount(),

            unanswered:
                this.getUnansweredCount(),

            review:
                this.getReviewCount(),

            visited:
                this.getVisitedCount(),

            correct:
                this.getCorrectCount(),

            incorrect:
                this.getIncorrectCount(),

            score:
                this.calculateScore(),

            progress:
                this.getProgressPercentage(),

            elapsedTime:
                this.elapsedTime,

            remainingTime:
                this.remainingTime,

            formattedElapsedTime:
                this.getFormattedElapsedTime(),

            formattedRemainingTime:
                this.getFormattedRemainingTime(),

            domains:
                this.calculateDomainResults()

        };

    }


    /*
    ======================================================
    FINALIZAÇÃO
    ======================================================
    */

    finish(reason = "user") {

        if (this.finished) {

            return this.result;

        }


        this.finished = true;

        this.paused = false;

        this.finishedAt =
            new Date().toISOString();

        this.finishReason =
            reason;


        this.result =
            this.buildResult();


        return this.result;

    }


    /*
    ======================================================
    RESULTADO FINAL
    ======================================================
    */

    buildResult() {

        const statistics =
            this.getStatistics();


        return {

            examId:
                this.id,

            title:
                this.title,

            domain:
                this.domain,

            mode:
                this.mode,

            startedAt:
                this.startedAt,

            finishedAt:
                this.finishedAt,

            finishReason:
                this.finishReason,

            totalQuestions:
                statistics.total,

            answered:
                statistics.answered,

            unanswered:
                statistics.unanswered,

            correct:
                statistics.correct,

            incorrect:
                statistics.incorrect,

            review:
                statistics.review,

            score:
                statistics.score,

            elapsedTime:
                statistics.elapsedTime,

            remainingTime:
                statistics.remainingTime,

            formattedElapsedTime:
                statistics
                    .formattedElapsedTime,

            domains:
                statistics.domains,

            questions:
                this.buildQuestionResults()

        };

    }


    /*
    ======================================================
    RESULTADO INDIVIDUAL DAS QUESTÕES
    ======================================================
    */

    buildQuestionResults() {

        return this.questions.map(
            (question, index) => {

                return {

                    index:
                        index,

                    number:
                        index + 1,

                    id:
                        question.getId(),

                    domain:
                        question.getDomain(),

                    type:
                        question.getType(),

                    question:
                        question.getQuestion(),

                    answered:
                        question.isAnswered(),

                    correct:
                        question.isAnswered()
                            ? question.isCorrect()
                            : false,

                    review:
                        question
                            .isMarkedForReview(),

                    userAnswers:
                        question
                            .getUserAnswers(),

                    correctAnswers:
                        question
                            .getCorrectAnswers(),

                    explanation:
                        question
                            .getExplanation()

                };

            }
        );

    }


    /*
    ======================================================
    RESET DO EXAME
    ======================================================
    */

    reset() {

        this.questions.forEach(
            question =>
                question.reset()
        );


        this.currentIndex = 0;

        this.remainingTime =
            this.duration;

        this.elapsedTime = 0;

        this.startedAt = null;

        this.finishedAt = null;

        this.started = false;

        this.finished = false;

        this.paused = false;

        this.finishReason = null;

        this.result = null;


        return true;

    }


    /*
    ======================================================
    NORMALIZA ÍNDICE
    ======================================================
    */

    normalizeCurrentIndex() {

        if (
            this.questions.length === 0
        ) {

            this.currentIndex = 0;

            return;

        }


        if (this.currentIndex < 0) {

            this.currentIndex = 0;

        }


        if (
            this.currentIndex >=
            this.questions.length
        ) {

            this.currentIndex =
                this.questions.length - 1;

        }

    }


    /*
    ======================================================
    ID DA SESSÃO
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
    SERIALIZAÇÃO
    ======================================================
    */

    toJSON() {

        return {

            id:
                this.id,

            title:
                this.title,

            domain:
                this.domain,

            mode:
                this.mode,

            questions:
                this.questions.map(
                    question =>
                        question.toJSON()
                ),

            totalQuestions:
                this.totalQuestions,

            currentIndex:
                this.currentIndex,

            duration:
                this.duration,

            remainingTime:
                this.remainingTime,

            elapsedTime:
                this.elapsedTime,

            startedAt:
                this.startedAt,

            finishedAt:
                this.finishedAt,

            started:
                this.started,

            finished:
                this.finished,

            paused:
                this.paused,

            finishReason:
                this.finishReason,

            result:
                this.result

        };

    }


    /*
    ======================================================
    RESTAURAÇÃO
    ======================================================
    */

    static fromJSON(data = {}) {

        return new Exam(data);

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.Exam = Exam;
