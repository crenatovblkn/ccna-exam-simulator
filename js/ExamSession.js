/*
==========================================================
CCNA Exam Simulator
Exam Session Manager

Arquivo: js/ExamSession.js
==========================================================
*/

class ExamSession {

    constructor() {

        this.questions = [];

        this.currentIndex = 0;

        this.started = false;
        this.finished = false;

        this.startTime = null;
        this.endTime = null;

        this.durationMinutes = 0;

        /*
        answers:

        single / multiple / cli
        {
            "NF-0001": ["A"]
        }

        matching
        {
            "NF-0002": {
                "L1": "R2",
                "L2": "R1"
            }
        }

        ordering
        {
            "NF-0003": [
                "O2",
                "O1",
                "O3"
            ]
        }
        */

        this.answers = {};

        /*
        IDs das questões marcadas
        para revisão.
        */

        this.reviewQuestions = new Set();

    }


    /*
    ======================================================
    INICIAR PROVA
    ======================================================
    */

    start(questions, durationMinutes = 0) {

        if (
            !Array.isArray(questions) ||
            questions.length === 0
        ) {

            throw new Error(
                "Não é possível iniciar uma prova sem questões."
            );

        }

        this.questions =
            this.clone(questions);

        this.currentIndex = 0;

        this.answers = {};

        this.reviewQuestions =
            new Set();

        this.durationMinutes =
            Number(durationMinutes) || 0;

        this.startTime =
            Date.now();

        this.endTime = null;

        this.started = true;
        this.finished = false;

        return this.getCurrentQuestion();

    }


    /*
    ======================================================
    ESTADO DA PROVA
    ======================================================
    */

    isStarted() {

        return this.started;

    }


    isFinished() {

        return this.finished;

    }


    /*
    ======================================================
    TOTAL DE QUESTÕES
    ======================================================
    */

    getTotalQuestions() {

        return this.questions.length;

    }


    /*
    ======================================================
    ÍNDICE ATUAL
    ======================================================
    */

    getCurrentIndex() {

        return this.currentIndex;

    }


    /*
    ======================================================
    NÚMERO VISUAL DA QUESTÃO
    ======================================================
    */

    getCurrentNumber() {

        return this.currentIndex + 1;

    }


    /*
    ======================================================
    QUESTÃO ATUAL
    ======================================================
    */

    getCurrentQuestion() {

        if (
            this.questions.length === 0
        ) {

            return null;

        }

        return this.clone(
            this.questions[
                this.currentIndex
            ]
        );

    }


    /*
    ======================================================
    QUESTÃO POR ÍNDICE
    ======================================================
    */

    getQuestion(index) {

        if (
            index < 0 ||
            index >= this.questions.length
        ) {

            return null;

        }

        return this.clone(
            this.questions[index]
        );

    }


    /*
    ======================================================
    QUESTÃO POR ID
    ======================================================
    */

    getQuestionById(questionId) {

        const question =
            this.questions.find(
                item =>
                    item.id === questionId
            );

        if (!question) {

            return null;

        }

        return this.clone(question);

    }


    /*
    ======================================================
    NAVEGAR PARA QUESTÃO
    ======================================================
    */

    goTo(index) {

        if (!this.started) {

            return false;

        }

        if (this.finished) {

            return false;

        }

        const targetIndex =
            Number(index);

        if (
            !Number.isInteger(targetIndex) ||
            targetIndex < 0 ||
            targetIndex >=
                this.questions.length
        ) {

            return false;

        }

        this.currentIndex =
            targetIndex;

        return true;

    }


    /*
    ======================================================
    PRÓXIMA QUESTÃO
    ======================================================
    */

    next() {

        if (
            this.currentIndex >=
            this.questions.length - 1
        ) {

            return false;

        }

        this.currentIndex++;

        return true;

    }


    /*
    ======================================================
    QUESTÃO ANTERIOR
    ======================================================
    */

    previous() {

        if (
            this.currentIndex <= 0
        ) {

            return false;

        }

        this.currentIndex--;

        return true;

    }


    /*
    ======================================================
    VERIFICAR PRIMEIRA QUESTÃO
    ======================================================
    */

    isFirstQuestion() {

        return this.currentIndex === 0;

    }


    /*
    ======================================================
    VERIFICAR ÚLTIMA QUESTÃO
    ======================================================
    */

    isLastQuestion() {

        return (
            this.currentIndex ===
            this.questions.length - 1
        );

    }


    /*
    ======================================================
    SALVAR RESPOSTA
    ======================================================
    */

    setAnswer(questionId, answer) {

        if (
            !this.started ||
            this.finished
        ) {

            return false;

        }

        const question =
            this.findInternalQuestion(
                questionId
            );

        if (!question) {

            return false;

        }


        /*
        --------------------------------------------------
        SINGLE / CLI
        --------------------------------------------------
        */

        if (
            question.type === "single" ||
            question.type === "cli"
        ) {

            let value = answer;

            if (Array.isArray(answer)) {

                value = answer[0];

            }

            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {

                delete this.answers[
                    questionId
                ];

                return true;

            }

            this.answers[
                questionId
            ] = [
                String(value)
            ];

            return true;

        }


        /*
        --------------------------------------------------
        MULTIPLE
        --------------------------------------------------
        */

        if (
            question.type === "multiple"
        ) {

            if (!Array.isArray(answer)) {

                answer = [answer];

            }

            const normalized =
                answer
                    .filter(
                        value =>
                            value !== undefined &&
                            value !== null &&
                            value !== ""
                    )
                    .map(String);

            const unique =
                [...new Set(normalized)];

            if (unique.length === 0) {

                delete this.answers[
                    questionId
                ];

                return true;

            }

            this.answers[
                questionId
            ] = unique;

            return true;

        }


        /*
        --------------------------------------------------
        MATCHING
        --------------------------------------------------
        */

        if (
            question.type === "matching"
        ) {

            if (
                !answer ||
                typeof answer !== "object" ||
                Array.isArray(answer)
            ) {

                return false;

            }

            this.answers[
                questionId
            ] = {
                ...answer
            };

            return true;

        }


        /*
        --------------------------------------------------
        ORDERING
        --------------------------------------------------
        */

        if (
            question.type === "ordering"
        ) {

            if (!Array.isArray(answer)) {

                return false;

            }

            this.answers[
                questionId
            ] = answer.map(String);

            return true;

        }

        return false;

    }


    /*
    ======================================================
    REMOVER RESPOSTA
    ======================================================
    */

    clearAnswer(questionId) {

        if (this.finished) {

            return false;

        }

        delete this.answers[
            questionId
        ];

        return true;

    }


    /*
    ======================================================
    OBTER RESPOSTA
    ======================================================
    */

    getAnswer(questionId) {

        if (
            !Object.prototype.hasOwnProperty.call(
                this.answers,
                questionId
            )
        ) {

            return null;

        }

        return this.clone(
            this.answers[
                questionId
            ]
        );

    }


    /*
    ======================================================
    VERIFICAR SE FOI RESPONDIDA
    ======================================================
    */

    isAnswered(questionId) {

        const question =
            this.findInternalQuestion(
                questionId
            );

        if (!question) {

            return false;

        }

        const answer =
            this.answers[
                questionId
            ];

        if (
            answer === undefined ||
            answer === null
        ) {

            return false;

        }


        /*
        Single / Multiple / CLI
        */

        if (
            question.type === "single" ||
            question.type === "multiple" ||
            question.type === "cli"
        ) {

            return (
                Array.isArray(answer) &&
                answer.length > 0
            );

        }


        /*
        Matching
        */

        if (
            question.type === "matching"
        ) {

            if (
                typeof answer !== "object" ||
                Array.isArray(answer)
            ) {

                return false;

            }

            const leftItems =
                question.matching?.left || [];

            if (leftItems.length === 0) {

                return false;

            }

            return leftItems.every(
                item =>
                    answer[item.id] !== undefined &&
                    answer[item.id] !== null &&
                    answer[item.id] !== ""
            );

        }


        /*
        Ordering
        */

        if (
            question.type === "ordering"
        ) {

            const items =
                question.ordering?.items || [];

            return (
                Array.isArray(answer) &&
                answer.length ===
                    items.length
            );

        }

        return false;

    }


    /*
    ======================================================
    MARCAR PARA REVISÃO
    ======================================================
    */

    setReview(
        questionId,
        value = true
    ) {

        const question =
            this.findInternalQuestion(
                questionId
            );

        if (!question) {

            return false;

        }

        if (value) {

            this.reviewQuestions.add(
                questionId
            );

        } else {

            this.reviewQuestions.delete(
                questionId
            );

        }

        return true;

    }


    /*
    ======================================================
    ALTERNAR REVISÃO
    ======================================================
    */

    toggleReview(questionId) {

        if (
            this.reviewQuestions.has(
                questionId
            )
        ) {

            this.reviewQuestions.delete(
                questionId
            );

            return false;

        }

        this.reviewQuestions.add(
            questionId
        );

        return true;

    }


    /*
    ======================================================
    VERIFICAR REVISÃO
    ======================================================
    */

    isMarkedForReview(questionId) {

        return this.reviewQuestions.has(
            questionId
        );

    }


    /*
    ======================================================
    TOTAL RESPONDIDAS
    ======================================================
    */

    getAnsweredCount() {

        return this.questions.filter(
            question =>
                this.isAnswered(
                    question.id
                )
        ).length;

    }


    /*
    ======================================================
    TOTAL NÃO RESPONDIDAS
    ======================================================
    */

    getUnansweredCount() {

        return (
            this.questions.length -
            this.getAnsweredCount()
        );

    }


    /*
    ======================================================
    TOTAL PARA REVISÃO
    ======================================================
    */

    getReviewCount() {

        return this.reviewQuestions.size;

    }


    /*
    ======================================================
    STATUS DE UMA QUESTÃO
    ======================================================
    */

    getQuestionStatus(questionId) {

        return {

            answered:
                this.isAnswered(
                    questionId
                ),

            review:
                this.isMarkedForReview(
                    questionId
                )

        };

    }


    /*
    ======================================================
    STATUS GERAL
    ======================================================
    */

    getProgress() {

        const total =
            this.getTotalQuestions();

        const answered =
            this.getAnsweredCount();

        const unanswered =
            this.getUnansweredCount();

        const review =
            this.getReviewCount();

        const percentage =
            total > 0
                ? Math.round(
                    (
                        answered /
                        total
                    ) * 100
                )
                : 0;

        return {

            total,
            answered,
            unanswered,
            review,
            percentage

        };

    }


    /*
    ======================================================
    CORRIGIR QUESTÃO
    ======================================================
    */

    isCorrect(questionId) {

        const question =
            this.findInternalQuestion(
                questionId
            );

        if (!question) {

            return false;

        }

        if (
            !this.isAnswered(
                questionId
            )
        ) {

            return false;

        }

        const userAnswer =
            this.answers[
                questionId
            ];


        /*
        --------------------------------------------------
        SINGLE / MULTIPLE / CLI
        --------------------------------------------------
        */

        if (
            question.type === "single" ||
            question.type === "multiple" ||
            question.type === "cli"
        ) {

            const correct =
                this.getCorrectAnswerIds(
                    question
                );

            const selected =
                [...userAnswer]
                    .map(String)
                    .sort();

            const expected =
                [...correct]
                    .map(String)
                    .sort();

            if (
                selected.length !==
                expected.length
            ) {

                return false;

            }

            return selected.every(
                (value, index) =>
                    value ===
                    expected[index]
            );

        }


        /*
        --------------------------------------------------
        MATCHING
        --------------------------------------------------
        */

        if (
            question.type === "matching"
        ) {

            const correct =
                question.matching.correct;

            const keys =
                Object.keys(correct);

            return keys.every(
                key =>
                    String(
                        userAnswer[key]
                    ) ===
                    String(
                        correct[key]
                    )
            );

        }


        /*
        --------------------------------------------------
        ORDERING
        --------------------------------------------------
        */

        if (
            question.type === "ordering"
        ) {

            const correct =
                question.ordering
                    .correctOrder;

            if (
                userAnswer.length !==
                correct.length
            ) {

                return false;

            }

            return correct.every(
                (item, index) =>
                    String(item) ===
                    String(
                        userAnswer[index]
                    )
            );

        }

        return false;

    }


    /*
    ======================================================
    RESPOSTAS CORRETAS
    SINGLE / MULTIPLE / CLI
    ======================================================
    */

    getCorrectAnswerIds(question) {

        /*
        Primeiro utiliza correctAnswers,
        caso exista no JSON.
        */

        if (
            Array.isArray(
                question.correctAnswers
            ) &&
            question.correctAnswers.length > 0
        ) {

            return question.correctAnswers.map(
                String
            );

        }


        /*
        Caso contrário, utiliza
        answers[].correct.
        */

        if (
            Array.isArray(
                question.answers
            )
        ) {

            return question.answers
                .filter(
                    answer =>
                        answer.correct === true
                )
                .map(
                    answer =>
                        String(answer.id)
                );

        }

        return [];

    }


    /*
    ======================================================
    CONTAR ACERTOS
    ======================================================
    */

    getCorrectCount() {

        return this.questions.filter(
            question =>
                this.isCorrect(
                    question.id
                )
        ).length;

    }


    /*
    ======================================================
    CONTAR ERROS
    ======================================================
    */

    getIncorrectCount() {

        return this.questions.filter(
            question => {

                if (
                    !this.isAnswered(
                        question.id
                    )
                ) {

                    return false;

                }

                return !this.isCorrect(
                    question.id
                );

            }
        ).length;

    }


    /*
    ======================================================
    PONTUAÇÃO
    ======================================================
    */

    getScore() {

        const total =
            this.getTotalQuestions();

        const correct =
            this.getCorrectCount();

        const incorrect =
            this.getIncorrectCount();

        const unanswered =
            this.getUnansweredCount();

        const percentage =
            total > 0
                ? Number(
                    (
                        (
                            correct /
                            total
                        ) * 100
                    ).toFixed(2)
                )
                : 0;

        return {

            total,
            correct,
            incorrect,
            unanswered,
            percentage

        };

    }


    /*
    ======================================================
    FINALIZAR PROVA
    ======================================================
    */

    finish() {

        if (!this.started) {

            return null;

        }

        if (this.finished) {

            return this.getResult();

        }

        this.endTime =
            Date.now();

        this.finished = true;

        return this.getResult();

    }


    /*
    ======================================================
    RESULTADO
    ======================================================
    */

    getResult() {

        const score =
            this.getScore();

        return {

            ...score,

            review:
                this.getReviewCount(),

            startedAt:
                this.startTime,

            finishedAt:
                this.endTime,

            elapsedSeconds:
                this.getElapsedSeconds(),

            questions:
                this.getDetailedResults()

        };

    }


    /*
    ======================================================
    RESULTADO DETALHADO
    ======================================================
    */

    getDetailedResults() {

        return this.questions.map(
            (question, index) => {

                return {

                    number:
                        index + 1,

                    id:
                        question.id,

                    type:
                        question.type,

                    domain:
                        question.domain,

                    answered:
                        this.isAnswered(
                            question.id
                        ),

                    review:
                        this.isMarkedForReview(
                            question.id
                        ),

                    correct:
                        this.isCorrect(
                            question.id
                        ),

                    userAnswer:
                        this.getAnswer(
                            question.id
                        )

                };

            }
        );

    }


    /*
    ======================================================
    TEMPO DECORRIDO
    ======================================================
    */

    getElapsedSeconds() {

        if (!this.startTime) {

            return 0;

        }

        const referenceTime =
            this.endTime ||
            Date.now();

        return Math.max(
            0,
            Math.floor(
                (
                    referenceTime -
                    this.startTime
                ) / 1000
            )
        );

    }


    /*
    ======================================================
    TEMPO TOTAL EM SEGUNDOS
    ======================================================
    */

    getDurationSeconds() {

        return (
            this.durationMinutes *
            60
        );

    }


    /*
    ======================================================
    TEMPO RESTANTE
    ======================================================
    */

    getRemainingSeconds() {

        const duration =
            this.getDurationSeconds();

        /*
        Prova sem limite de tempo.
        */

        if (duration <= 0) {

            return null;

        }

        const remaining =
            duration -
            this.getElapsedSeconds();

        return Math.max(
            0,
            remaining
        );

    }


    /*
    ======================================================
    TEMPO ESGOTADO
    ======================================================
    */

    isTimeExpired() {

        const remaining =
            this.getRemainingSeconds();

        if (remaining === null) {

            return false;

        }

        return remaining <= 0;

    }


    /*
    ======================================================
    LOCALIZAR QUESTÃO INTERNA
    ======================================================
    */

    findInternalQuestion(questionId) {

        return this.questions.find(
            question =>
                question.id ===
                questionId
        ) || null;

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    reset() {

        this.questions = [];

        this.currentIndex = 0;

        this.answers = {};

        this.reviewQuestions =
            new Set();

        this.started = false;
        this.finished = false;

        this.startTime = null;
        this.endTime = null;

        this.durationMinutes = 0;

    }


    /*
    ======================================================
    CLONE
    ======================================================
    */

    clone(data) {

        if (
            data === undefined ||
            data === null
        ) {

            return data;

        }

        return JSON.parse(
            JSON.stringify(data)
        );

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamSession = ExamSession;
