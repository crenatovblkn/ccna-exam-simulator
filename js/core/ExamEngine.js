/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
Exam Engine

Arquivo:
js/core/ExamEngine.js

Responsabilidade:
- Criar e controlar uma tentativa de exame
- Selecionar questões através do QuestionManager
- Controlar navegação
- Registrar respostas
- Controlar revisão
- Controlar tempo
- Finalizar a prova
- Entregar resultado
- Emitir eventos para a interface

O ExamEngine NÃO manipula HTML.
==========================================================
*/

class ExamEngine {

    constructor(questionManager = null) {

        this.questionManager =
            questionManager;

        this.exam =
            null;

        this.listeners =
            {};

        this.timerInterval =
            null;

        this.remainingTime =
            0;

        this.duration =
            0;

    }


    /*
    ======================================================
    QUESTION MANAGER
    ======================================================
    */

    setQuestionManager(
        questionManager
    ) {

        this.questionManager =
            questionManager;

        return this;

    }


    getQuestionManager() {

        return this.questionManager;

    }


    /*
    ======================================================
    EXAME
    ======================================================
    */

    getExam() {

        return this.exam;

    }


    hasExam() {

        return this.exam !== null;

    }


    /*
    ======================================================
    INICIAR EXAME
    ======================================================
    */

    startExam(options = {}) {

        if (!this.questionManager) {

            throw new Error(
                "ExamEngine: QuestionManager não foi configurado."
            );

        }


        /*
        --------------------------------------------------
        Quantidade solicitada
        --------------------------------------------------
        */

        let questionCount =
            Number(
                options.questionCount
            );


        if (
            !Number.isInteger(
                questionCount
            ) ||
            questionCount <= 0
        ) {

            questionCount = 20;

        }


        /*
        --------------------------------------------------
        Quantidade disponível
        --------------------------------------------------
        */

        const available =
            this.getAvailableQuestionCount();


        if (available <= 0) {

            throw new Error(
                "ExamEngine: o banco de questões está vazio."
            );

        }


        questionCount =
            Math.min(
                questionCount,
                available
            );


        /*
        --------------------------------------------------
        Seleciona questões
        --------------------------------------------------
        */

        const questions =
            this.selectQuestions(
                questionCount
            );


        if (
            !Array.isArray(
                questions
            ) ||
            questions.length === 0
        ) {

            throw new Error(
                "ExamEngine: não foi possível selecionar questões para o exame."
            );

        }


        /*
        --------------------------------------------------
        Duração em segundos
        --------------------------------------------------
        */

        let duration =
            Number(
                options.duration
            );


        if (
            !Number.isFinite(
                duration
            ) ||
            duration < 0
        ) {

            duration = 0;

        }


        duration =
            Math.floor(
                duration
            );


        this.duration =
            duration;

        this.remainingTime =
            duration;


        /*
        --------------------------------------------------
        Interrompe timer anterior
        --------------------------------------------------
        */

        this.stopTimer();


        /*
        --------------------------------------------------
        Cria Exam

        Mantemos a criação flexível para o modelo Exam
        utilizado pelo projeto.
        --------------------------------------------------
        */

        this.exam =
            this.createExam(
                questions,
                options
            );


        if (!this.exam) {

            throw new Error(
                "ExamEngine: não foi possível criar o exame."
            );

        }


        /*
        --------------------------------------------------
        Inicia o modelo
        --------------------------------------------------
        */

        if (
            typeof this.exam.start ===
            "function"
        ) {

            this.exam.start();

        }


        /*
        --------------------------------------------------
        Primeira questão visitada
        --------------------------------------------------
        */

        const currentQuestion =
            this.getCurrentQuestion();


        if (
            currentQuestion &&
            typeof currentQuestion.visit ===
            "function"
        ) {

            currentQuestion.visit();

        }


        /*
        --------------------------------------------------
        Eventos
        --------------------------------------------------
        */

        this.emit(
            "examStarted",
            {

                exam:
                    this.exam,

                questionCount:
                    this.getTotalQuestions(),

                duration:
                    this.duration

            }
        );


        this.emitState();


        return this.exam;

    }


    /*
    ======================================================
    CRIAR MODELO EXAM
    ======================================================
    */

    createExam(
        questions,
        options = {}
    ) {

        /*
        O modelo Exam já pertence ao projeto.

        Primeiro tentamos o formato baseado em objeto.
        Caso o modelo aceite simplesmente as questões,
        mantemos compatibilidade.
        */

        let exam = null;


        try {

            exam =
                new Exam({

                    title:
                        options.title ||
                        "Cisco CCNA 200-301",

                    domain:
                        options.domain ||
                        "Network Fundamentals",

                    questions:
                        questions,

                    duration:
                        this.duration,

                    passingScore:
                        Number(
                            options.passingScore
                        ) || 70

                });

        } catch (error) {

            exam =
                new Exam(
                    questions
                );

        }


        /*
        --------------------------------------------------
        Proteção para modelos que não recebem questions
        corretamente pelo construtor.
        --------------------------------------------------
        */

        if (
            exam &&
            typeof exam.getTotalQuestions ===
            "function" &&
            exam.getTotalQuestions() === 0
        ) {

            if (
                typeof exam.setQuestions ===
                "function"
            ) {

                exam.setQuestions(
                    questions
                );

            } else if (
                Array.isArray(
                    exam.questions
                )
            ) {

                exam.questions =
                    questions;

            }

        }


        /*
        Duração.
        */

        if (
            exam &&
            this.duration > 0
        ) {

            if (
                typeof exam.setDuration ===
                "function"
            ) {

                exam.setDuration(
                    this.duration
                );

            } else {

                exam.duration =
                    this.duration;

            }

        }


        return exam;

    }


    /*
    ======================================================
    SELECIONAR QUESTÕES
    ======================================================
    */

    selectQuestions(
        questionCount
    ) {

        const manager =
            this.questionManager;


        /*
        --------------------------------------------------
        Método específico de seleção
        --------------------------------------------------
        */

        if (
            typeof manager.selectQuestions ===
            "function"
        ) {

            const selected =
                manager.selectQuestions(
                    questionCount
                );


            if (
                Array.isArray(
                    selected
                )
            ) {

                return selected;

            }

        }


        /*
        --------------------------------------------------
        Método getRandomQuestions
        --------------------------------------------------
        */

        if (
            typeof manager.getRandomQuestions ===
            "function"
        ) {

            const selected =
                manager.getRandomQuestions(
                    questionCount
                );


            if (
                Array.isArray(
                    selected
                )
            ) {

                return selected;

            }

        }


        /*
        --------------------------------------------------
        Método getRandom
        --------------------------------------------------
        */

        if (
            typeof manager.getRandom ===
            "function"
        ) {

            const selected =
                manager.getRandom(
                    questionCount
                );


            if (
                Array.isArray(
                    selected
                )
            ) {

                return selected;

            }

        }


        /*
        --------------------------------------------------
        Recupera coleção completa
        --------------------------------------------------
        */

        let questions = [];


        if (
            typeof manager.getAll ===
            "function"
        ) {

            questions =
                manager.getAll();

        } else if (
            typeof manager.getQuestions ===
            "function"
        ) {

            questions =
                manager.getQuestions();

        } else if (
            Array.isArray(
                manager.questions
            )
        ) {

            questions =
                manager.questions;

        }


        if (
            !Array.isArray(
                questions
            )
        ) {

            return [];

        }


        /*
        --------------------------------------------------
        Clone

        Evita que uma tentativa altere o banco original.
        --------------------------------------------------
        */

        const cloned =
            questions.map(
                question => {

                    if (
                        question &&
                        typeof question.clone ===
                        "function"
                    ) {

                        return question.clone();

                    }


                    if (
                        question instanceof Question
                    ) {

                        return new Question(
                            question.toJSON()
                        );

                    }


                    return new Question(
                        question
                    );

                }
            );


        /*
        --------------------------------------------------
        Embaralhamento Fisher-Yates
        --------------------------------------------------
        */

        for (
            let index =
                cloned.length - 1;

            index > 0;

            index--
        ) {

            const randomIndex =
                Math.floor(
                    Math.random() *
                    (index + 1)
                );


            [
                cloned[index],
                cloned[randomIndex]
            ] =
            [
                cloned[randomIndex],
                cloned[index]
            ];

        }


        return cloned.slice(
            0,
            questionCount
        );

    }


    /*
    ======================================================
    QUANTIDADE DISPONÍVEL
    ======================================================
    */

    getAvailableQuestionCount() {

        const manager =
            this.questionManager;


        if (!manager) {

            return 0;

        }


        if (
            typeof manager.getCount ===
            "function"
        ) {

            return Number(
                manager.getCount()
            ) || 0;

        }


        if (
            typeof manager.getTotalQuestions ===
            "function"
        ) {

            return Number(
                manager.getTotalQuestions()
            ) || 0;

        }


        if (
            typeof manager.getAll ===
            "function"
        ) {

            const questions =
                manager.getAll();


            return Array.isArray(
                questions
            )
                ? questions.length
                : 0;

        }


        if (
            Array.isArray(
                manager.questions
            )
        ) {

            return manager
                .questions
                .length;

        }


        return 0;

    }


    /*
    ======================================================
    QUESTÃO ATUAL
    ======================================================
    */

    getCurrentQuestion() {

        if (!this.exam) {

            return null;

        }


        if (
            typeof this.exam
                .getCurrentQuestion ===
                "function"
        ) {

            return this.exam
                .getCurrentQuestion();

        }


        const index =
            this.getCurrentIndex();


        if (
            typeof this.exam.getQuestion ===
            "function"
        ) {

            return this.exam
                .getQuestion(
                    index
                );

        }


        const questions =
            this.getQuestions();


        return (
            questions[index] ||
            null
        );

    }


    /*
    ======================================================
    ÍNDICE ATUAL
    ======================================================
    */

    getCurrentIndex() {

        if (!this.exam) {

            return 0;

        }


        if (
            typeof this.exam
                .getCurrentIndex ===
                "function"
        ) {

            return Number(
                this.exam
                    .getCurrentIndex()
            ) || 0;

        }


        return Number(
            this.exam.currentIndex
        ) || 0;

    }


    /*
    ======================================================
    TOTAL
    ======================================================
    */

    getTotalQuestions() {

        if (!this.exam) {

            return 0;

        }


        if (
            typeof this.exam
                .getTotalQuestions ===
                "function"
        ) {

            return Number(
                this.exam
                    .getTotalQuestions()
            ) || 0;

        }


        return this
            .getQuestions()
            .length;

    }


    /*
    ======================================================
    QUESTÕES
    ======================================================
    */

    getQuestions() {

        if (!this.exam) {

            return [];

        }


        if (
            typeof this.exam
                .getQuestions ===
                "function"
        ) {

            const questions =
                this.exam
                    .getQuestions();


            return Array.isArray(
                questions
            )
                ? questions
                : [];

        }


        return Array.isArray(
            this.exam.questions
        )
            ? this.exam.questions
            : [];

    }


    /*
    ======================================================
    NAVEGAÇÃO - PRÓXIMA
    ======================================================
    */

    nextQuestion() {

        if (!this.exam) {

            return false;

        }


        if (!this.hasNext()) {

            return false;

        }


        let moved = false;


        if (
            typeof this.exam.nextQuestion ===
            "function"
        ) {

            const result =
                this.exam.nextQuestion();

            moved =
                result !== false;

        } else {

            moved =
                this.goToQuestion(
                    this.getCurrentIndex() + 1,
                    false
                );

        }


        if (!moved) {

            return false;

        }


        this.visitCurrentQuestion();


        this.emit(
            "questionChanged",
            {

                index:
                    this.getCurrentIndex(),

                question:
                    this.getCurrentQuestion()

            }
        );


        this.emitState();


        return true;

    }


    /*
    ======================================================
    ALIAS NEXT
    ======================================================
    */

    next() {

        return this.nextQuestion();

    }


    /*
    ======================================================
    NAVEGAÇÃO - ANTERIOR
    ======================================================
    */

    previousQuestion() {

        if (!this.exam) {

            return false;

        }


        if (!this.hasPrevious()) {

            return false;

        }


        let moved = false;


        if (
            typeof this.exam
                .previousQuestion ===
                "function"
        ) {

            const result =
                this.exam
                    .previousQuestion();

            moved =
                result !== false;

        } else {

            moved =
                this.goToQuestion(
                    this.getCurrentIndex() - 1,
                    false
                );

        }


        if (!moved) {

            return false;

        }


        this.visitCurrentQuestion();


        this.emit(
            "questionChanged",
            {

                index:
                    this.getCurrentIndex(),

                question:
                    this.getCurrentQuestion()

            }
        );


        this.emitState();


        return true;

    }


    /*
    ======================================================
    ALIAS PREVIOUS
    ======================================================
    */

    previous() {

        return this.previousQuestion();

    }


    /*
    ======================================================
    IR PARA QUESTÃO
    ======================================================
    */

    goToQuestion(
        index,
        emitEvent = true
    ) {

        if (!this.exam) {

            return false;

        }


        index =
            Number(index);


        if (
            !Number.isInteger(
                index
            ) ||
            index < 0 ||
            index >=
                this.getTotalQuestions()
        ) {

            return false;

        }


        let moved = false;


        if (
            typeof this.exam
                .goToQuestion ===
                "function"
        ) {

            const result =
                this.exam
                    .goToQuestion(
                        index
                    );

            moved =
                result !== false;

        } else if (
            typeof this.exam
                .goTo ===
                "function"
        ) {

            const result =
                this.exam.goTo(
                    index
                );

            moved =
                result !== false;

        } else {

            this.exam.currentIndex =
                index;

            moved = true;

        }


        if (!moved) {

            return false;

        }


        this.visitCurrentQuestion();


        if (emitEvent) {

            this.emit(
                "questionChanged",
                {

                    index:
                        this.getCurrentIndex(),

                    question:
                        this.getCurrentQuestion()

                }
            );


            this.emitState();

        }


        return true;

    }


    /*
    ======================================================
    ALIAS GOTO
    ======================================================
    */

    goTo(index) {

        return this.goToQuestion(
            index
        );

    }


    /*
    ======================================================
    VISITAR ATUAL
    ======================================================
    */

    visitCurrentQuestion() {

        const question =
            this.getCurrentQuestion();


        if (
            question &&
            typeof question.visit ===
            "function"
        ) {

            question.visit();

        }

    }


    /*
    ======================================================
    NAVEGAÇÃO
    ======================================================
    */

    hasNext() {

        if (!this.exam) {

            return false;

        }


        if (
            typeof this.exam.hasNext ===
            "function"
        ) {

            return Boolean(
                this.exam.hasNext()
            );

        }


        return (
            this.getCurrentIndex() <
            this.getTotalQuestions() - 1
        );

    }


    hasPrevious() {

        if (!this.exam) {

            return false;

        }


        if (
            typeof this.exam.hasPrevious ===
            "function"
        ) {

            return Boolean(
                this.exam.hasPrevious()
            );

        }


        return (
            this.getCurrentIndex() >
            0
        );

    }


    isFirstQuestion() {

        return (
            this.getCurrentIndex() ===
            0
        );

    }


    isLastQuestion() {

        const total =
            this.getTotalQuestions();


        return (
            total > 0 &&
            this.getCurrentIndex() ===
                total - 1
        );

    }


    /*
    ======================================================
    RESPOSTA SINGLE / MULTIPLE
    ======================================================
    */

    answer(answerId) {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        if (
            typeof question.answer !==
            "function"
        ) {

            return false;

        }


        question.answer(
            answerId
        );


        this.emitAnswerChanged(
            question
        );


        return true;

    }


    /*
    ======================================================
    DEFINIR RESPOSTAS
    ======================================================
    */

    setAnswers(answerIds = []) {

        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            typeof question.setAnswers !==
            "function"
        ) {

            return false;

        }


        question.setAnswers(
            answerIds
        );


        this.emitAnswerChanged(
            question
        );


        return true;

    }


    /*
    ======================================================
    LIMPAR RESPOSTA
    ======================================================
    */

    clearAnswer() {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        if (
            typeof question.clearAnswers ===
            "function"
        ) {

            question.clearAnswers();

        } else {

            return false;

        }


        this.emitAnswerChanged(
            question
        );


        return true;

    }


    /*
    ======================================================
    MATCHING
    ======================================================
    */

    setMatchingAnswer(
        leftId,
        rightId
    ) {

        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            typeof question
                .setMatchingAnswer !==
                "function"
        ) {

            return false;

        }


        question.setMatchingAnswer(
            leftId,
            rightId
        );


        this.emitAnswerChanged(
            question
        );


        return true;

    }


    /*
    ======================================================
    ORDERING
    ======================================================
    */

    setOrder(order = []) {

        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            typeof question.setOrder !==
                "function"
        ) {

            return false;

        }


        question.setOrder(
            order
        );


        this.emitAnswerChanged(
            question
        );


        return true;

    }


    /*
    ======================================================
    LAB
    ======================================================
    */

    setLabState(state = {}) {

        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            typeof question.setLabState !==
                "function"
        ) {

            return false;

        }


        question.setLabState(
            state
        );


        this.emitAnswerChanged(
            question
        );


        return true;

    }


    /*
    ======================================================
    EVENTO DE RESPOSTA
    ======================================================
    */

    emitAnswerChanged(
        question
    ) {

        this.emit(
            "answerChanged",
            {

                index:
                    this.getCurrentIndex(),

                question:
                    question

            }
        );


        this.emitState();

    }


    /*
    ======================================================
    REVISÃO
    ======================================================
    */

    toggleReview() {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        let review;


        if (
            typeof question.toggleReview ===
            "function"
        ) {

            review =
                question.toggleReview();

        } else {

            question.review =
                !Boolean(
                    question.review
                );

            review =
                question.review;

        }


        this.emit(
            "reviewChanged",
            {

                index:
                    this.getCurrentIndex(),

                question:
                    question,

                review:
                    Boolean(review)

            }
        );


        this.emitState();


        return Boolean(
            review
        );

    }


    /*
    ======================================================
    ESTADO DA QUESTÃO
    ======================================================
    */

    hasAnsweredCurrentQuestion() {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        if (
            typeof question.isAnswered ===
            "function"
        ) {

            return Boolean(
                question.isAnswered()
            );

        }


        return false;

    }


    isCurrentQuestionMarkedForReview() {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        if (
            typeof question
                .isMarkedForReview ===
                "function"
        ) {

            return Boolean(
                question
                    .isMarkedForReview()
            );

        }


        return Boolean(
            question.review
        );

    }


    /*
    ======================================================
    CONTADORES
    ======================================================
    */

    getAnsweredCount() {

        return this
            .getQuestions()
            .filter(
                question =>
                    question &&
                    typeof question
                        .isAnswered ===
                        "function" &&
                    question.isAnswered()
            )
            .length;

    }


    getUnansweredCount() {

        return Math.max(
            0,
            this.getTotalQuestions() -
            this.getAnsweredCount()
        );

    }


    getRemainingCount() {

        return this
            .getUnansweredCount();

    }


    getReviewCount() {

        return this
            .getQuestions()
            .filter(
                question => {

                    if (!question) {

                        return false;

                    }


                    if (
                        typeof question
                            .isMarkedForReview ===
                            "function"
                    ) {

                        return question
                            .isMarkedForReview();

                    }


                    return Boolean(
                        question.review
                    );

                }
            )
            .length;

    }


    /*
    ======================================================
    PROGRESSO
    ======================================================
    */

    getProgress() {

        const total =
            this.getTotalQuestions();


        const current =
            total > 0
                ? this.getCurrentIndex() + 1
                : 0;


        const answered =
            this.getAnsweredCount();


        const percent =
            total > 0
                ? Math.round(
                    (
                        answered /
                        total
                    ) * 100
                )
                : 0;


        return {

            current,

            total,

            answered,

            remaining:
                this.getRemainingCount(),

            review:
                this.getReviewCount(),

            percent

        };

    }


    /*
    ======================================================
    TIMER
    ======================================================
    */

    startTimer() {

        this.stopTimer();


        if (
            this.remainingTime <= 0
        ) {

            return false;

        }


        this.timerInterval =
            window.setInterval(
                () => {

                    this.remainingTime =
                        Math.max(
                            0,
                            this.remainingTime - 1
                        );


                    /*
                    Mantém o Exam sincronizado
                    quando o modelo possuir suporte.
                    */

                    if (this.exam) {

                        if (
                            typeof this.exam
                                .setRemainingTime ===
                                "function"
                        ) {

                            this.exam
                                .setRemainingTime(
                                    this.remainingTime
                                );

                        } else {

                            this.exam.remainingTime =
                                this.remainingTime;

                        }

                    }


                    this.emit(
                        "timeChanged",
                        {

                            remainingTime:
                                this.remainingTime,

                            elapsedTime:
                                this.getElapsedTime()

                        }
                    );


                    if (
                        this.remainingTime <= 0
                    ) {

                        this.stopTimer();


                        this.emit(
                            "timeExpired",
                            {}
                        );


                        this.finishExam(
                            "timer"
                        );

                    }

                },
                1000
            );


        return true;

    }


    stopTimer() {

        if (
            this.timerInterval !==
            null
        ) {

            window.clearInterval(
                this.timerInterval
            );

            this.timerInterval =
                null;

        }

    }


    /*
    ======================================================
    TEMPO RESTANTE
    ======================================================
    */

    getRemainingTime() {

        if (
            this.remainingTime > 0
        ) {

            return this.remainingTime;

        }


        if (!this.exam) {

            return 0;

        }


        if (
            typeof this.exam
                .getRemainingTime ===
                "function"
        ) {

            return Math.max(
                0,
                Number(
                    this.exam
                        .getRemainingTime()
                ) || 0
            );

        }


        return Math.max(
            0,
            Number(
                this.exam.remainingTime
            ) || 0
        );

    }


    /*
    ======================================================
    TEMPO DECORRIDO
    ======================================================
    */

    getElapsedTime() {

        if (!this.exam) {

            return 0;

        }


        if (
            typeof this.exam
                .getElapsedSeconds ===
                "function"
        ) {

            return Math.max(
                0,
                Number(
                    this.exam
                        .getElapsedSeconds()
                ) || 0
            );

        }


        if (
            typeof this.exam
                .getElapsedTime ===
                "function"
        ) {

            return Math.max(
                0,
                Number(
                    this.exam
                        .getElapsedTime()
                ) || 0
            );

        }


        if (
            this.duration > 0
        ) {

            return Math.max(
                0,
                this.duration -
                this.remainingTime
            );

        }


        return 0;

    }


    /*
    ======================================================
    FINALIZAR EXAME
    ======================================================
    */

    finishExam(
        reason = "manual"
    ) {

        if (!this.exam) {

            return false;

        }


        /*
        Evita finalizar duas vezes.
        */

        if (
            typeof this.exam.isFinished ===
                "function" &&
            this.exam.isFinished()
        ) {

            return this.getResult();

        }


        this.stopTimer();


        /*
        --------------------------------------------------
        Finaliza modelo
        --------------------------------------------------
        */

        let modelResult =
            null;


        if (
            typeof this.exam.finish ===
            "function"
        ) {

            modelResult =
                this.exam.finish();

        }


        /*
        --------------------------------------------------
        Resultado normalizado
        --------------------------------------------------
        */

        const result =
            this.buildResult(
                modelResult
            );


        result.finishReason =
            reason;


        this.emit(
            "examFinished",
            {

                exam:
                    this.exam,

                result:
                    result,

                reason:
                    reason

            }
        );


        this.emitState();


        return result;

    }


    /*
    ======================================================
    ALIAS FINISH
    ======================================================
    */

    finish() {

        return this.finishExam(
            "manual"
        );

    }


    /*
    ======================================================
    RESULTADO
    ======================================================
    */

    getResult() {

        if (!this.exam) {

            return null;

        }


        let result =
            null;


        if (
            typeof this.exam.getResult ===
            "function"
        ) {

            result =
                this.exam.getResult();

        }


        return this.buildResult(
            result
        );

    }


    /*
    ======================================================
    NORMALIZAR RESULTADO
    ======================================================
    */

    buildResult(
        baseResult = null
    ) {

        const questions =
            this.getQuestions();


        const totalQuestions =
            questions.length;


        let correct = 0;

        let incorrect = 0;

        let unanswered = 0;

        let review = 0;


        const questionResults =
            questions.map(
                (
                    question,
                    index
                ) => {

                    const answered =
                        question &&
                        typeof question
                            .isAnswered ===
                            "function"
                            ? Boolean(
                                question
                                    .isAnswered()
                            )
                            : false;


                    const isCorrect =
                        answered &&
                        question &&
                        typeof question
                            .isCorrect ===
                            "function"
                            ? Boolean(
                                question
                                    .isCorrect()
                            )
                            : false;


                    const marked =
                        question &&
                        typeof question
                            .isMarkedForReview ===
                            "function"
                            ? Boolean(
                                question
                                    .isMarkedForReview()
                            )
                            : Boolean(
                                question &&
                                question.review
                            );


                    if (!answered) {

                        unanswered++;

                    } else if (
                        isCorrect
                    ) {

                        correct++;

                    } else {

                        incorrect++;

                    }


                    if (marked) {

                        review++;

                    }


                    return {

                        number:
                            index + 1,

                        id:
                            this.getQuestionId(
                                question
                            ),

                        domain:
                            this.getQuestionDomain(
                                question
                            ),

                        type:
                            this.getQuestionType(
                                question
                            ),

                        question:
                            this.getQuestionText(
                                question
                            ),

                        answered:
                            answered,

                        correct:
                            isCorrect,

                        review:
                            marked,

                        userAnswers:
                            this.getUserAnswers(
                                question
                            ),

                        correctAnswers:
                            this.getCorrectAnswers(
                                question
                            ),

                        explanation:
                            this.getQuestionExplanation(
                                question
                            )

                    };

                }
            );


        const score =
            totalQuestions > 0
                ? Math.round(
                    (
                        correct /
                        totalQuestions
                    ) * 100
                )
                : 0;


        /*
        --------------------------------------------------
        Resultado base do Exam

        Preservamos dados adicionais produzidos pelo
        modelo, mas os campos críticos abaixo são
        recalculados diretamente das Question.
        --------------------------------------------------
        */

        const normalized =
            (
                baseResult &&
                typeof baseResult ===
                "object"
            )
                ? {
                    ...baseResult
                }
                : {};


        normalized.title =
            normalized.title ||
            "Cisco CCNA 200-301";


        normalized.domain =
            normalized.domain ||
            "Network Fundamentals";


        normalized.total =
            totalQuestions;


        normalized.totalQuestions =
            totalQuestions;


        normalized.answered =
            correct +
            incorrect;


        normalized.correct =
            correct;


        normalized.incorrect =
            incorrect;


        normalized.unanswered =
            unanswered;


        normalized.review =
            review;


        normalized.score =
            score;


        normalized.percentage =
            score;


        normalized.passingScore =
            Number.isFinite(
                Number(
                    normalized
                        .passingScore
                )
            )
                ? Number(
                    normalized
                        .passingScore
                )
                : 70;


        normalized.passed =
            score >=
            normalized.passingScore;


        normalized.elapsedTime =
            this.getElapsedTime();


        normalized.elapsedSeconds =
            normalized.elapsedTime;


        normalized.formattedElapsedTime =
            this.formatTime(
                normalized.elapsedTime
            );


        normalized.questions =
            questionResults;


        normalized.domains =
            this.buildDomainResults(
                questionResults
            );


        return normalized;

    }


    /*
    ======================================================
    RESULTADO POR DOMÍNIO
    ======================================================
    */

    buildDomainResults(
        questionResults
    ) {

        const domains = {};


        questionResults.forEach(
            item => {

                const name =
                    item.domain ||
                    "Network Fundamentals";


                if (!domains[name]) {

                    domains[name] = {

                        domain:
                            name,

                        total:
                            0,

                        correct:
                            0,

                        incorrect:
                            0,

                        unanswered:
                            0,

                        percentage:
                            0

                    };

                }


                const domain =
                    domains[name];


                domain.total++;


                if (!item.answered) {

                    domain.unanswered++;

                } else if (
                    item.correct
                ) {

                    domain.correct++;

                } else {

                    domain.incorrect++;

                }

            }
        );


        Object
            .values(
                domains
            )
            .forEach(
                domain => {

                    domain.percentage =
                        domain.total > 0
                            ? Math.round(
                                (
                                    domain.correct /
                                    domain.total
                                ) * 100
                            )
                            : 0;

                }
            );


        return domains;

    }


    /*
    ======================================================
    HELPERS DE QUESTION
    ======================================================
    */

    getQuestionId(
        question
    ) {

        if (!question) {

            return "";

        }


        if (
            typeof question.getId ===
            "function"
        ) {

            return String(
                question.getId() || ""
            );

        }


        return String(
            question.id || ""
        );

    }


    getQuestionDomain(
        question
    ) {

        if (!question) {

            return "";

        }


        if (
            typeof question.getDomain ===
            "function"
        ) {

            return String(
                question.getDomain() || ""
            );

        }


        return String(
            question.domain || ""
        );

    }


    getQuestionType(
        question
    ) {

        if (!question) {

            return "single";

        }


        if (
            typeof question.getType ===
            "function"
        ) {

            return String(
                question.getType() ||
                "single"
            );

        }


        return String(
            question.type ||
            "single"
        );

    }


    getQuestionText(
        question
    ) {

        if (!question) {

            return "";

        }


        if (
            typeof question.getQuestion ===
            "function"
        ) {

            return String(
                question.getQuestion() ||
                ""
            );

        }


        return String(
            question.question ||
            ""
        );

    }


    getQuestionExplanation(
        question
    ) {

        if (!question) {

            return "";

        }


        if (
            typeof question.getExplanation ===
            "function"
        ) {

            return String(
                question
                    .getExplanation() ||
                ""
            );

        }


        return String(
            question.explanation ||
            ""
        );

    }


    getUserAnswers(
        question
    ) {

        if (!question) {

            return [];

        }


        if (
            typeof question
                .getUserAnswers ===
                "function"
        ) {

            const answers =
                question
                    .getUserAnswers();


            return Array.isArray(
                answers
            )
                ? [...answers]
                : [];

        }


        return Array.isArray(
            question.userAnswers
        )
            ? [
                ...question.userAnswers
            ]
            : [];

    }


    getCorrectAnswers(
        question
    ) {

        if (!question) {

            return [];

        }


        if (
            typeof question
                .getCorrectAnswers ===
                "function"
        ) {

            const answers =
                question
                    .getCorrectAnswers();


            return Array.isArray(
                answers
            )
                ? [...answers]
                : [];

        }


        return Array.isArray(
            question.correctAnswers
        )
            ? [
                ...question.correctAnswers
            ]
            : [];

    }


    /*
    ======================================================
    FORMATAR TEMPO
    ======================================================
    */

    formatTime(
        totalSeconds
    ) {

        const seconds =
            Math.max(
                0,
                Math.floor(
                    Number(
                        totalSeconds
                    ) || 0
                )
            );


        const hours =
            Math.floor(
                seconds / 3600
            );


        const minutes =
            Math.floor(
                (
                    seconds % 3600
                ) / 60
            );


        const remainingSeconds =
            seconds % 60;


        return (
            String(hours)
                .padStart(
                    2,
                    "0"
                ) +
            ":" +
            String(minutes)
                .padStart(
                    2,
                    "0"
                ) +
            ":" +
            String(
                remainingSeconds
            ).padStart(
                2,
                "0"
            )
        );

    }


    /*
    ======================================================
    ESTADO COMPLETO
    ======================================================
    */

    getState() {

        return {

            exam:
                this.exam,

            currentIndex:
                this.getCurrentIndex(),

            totalQuestions:
                this.getTotalQuestions(),

            answered:
                this.getAnsweredCount(),

            unanswered:
                this.getUnansweredCount(),

            review:
                this.getReviewCount(),

            remainingTime:
                this.getRemainingTime(),

            elapsedTime:
                this.getElapsedTime(),

            progress:
                this.getProgress()

        };

    }


    /*
    ======================================================
    EMITIR ESTADO
    ======================================================
    */

    emitState() {

        this.emit(
            "stateChanged",
            this.getState()
        );

    }


    /*
    ======================================================
    EVENTOS
    ======================================================
    */

    on(
        eventName,
        callback
    ) {

        if (
            typeof eventName !==
                "string" ||
            typeof callback !==
                "function"
        ) {

            return () => {};

        }


        if (
            !Array.isArray(
                this.listeners[
                    eventName
                ]
            )
        ) {

            this.listeners[
                eventName
            ] = [];

        }


        this.listeners[
            eventName
        ].push(
            callback
        );


        return () => {

            this.off(
                eventName,
                callback
            );

        };

    }


    off(
        eventName,
        callback
    ) {

        if (
            !Array.isArray(
                this.listeners[
                    eventName
                ]
            )
        ) {

            return;

        }


        this.listeners[
            eventName
        ] =
            this.listeners[
                eventName
            ].filter(
                listener =>
                    listener !==
                    callback
            );

    }


    emit(
        eventName,
        payload = {}
    ) {

        const listeners =
            this.listeners[
                eventName
            ];


        if (
            !Array.isArray(
                listeners
            )
        ) {

            return;

        }


        [...listeners]
            .forEach(
                listener => {

                    try {

                        listener(
                            payload
                        );

                    } catch (
                        error
                    ) {

                        console.error(
                            `ExamEngine event error (${eventName}):`,
                            error
                        );

                    }

                }
            );

    }


    clearListeners() {

        this.listeners = {};

    }


    /*
    ======================================================
    RESTAURAR EXAME
    ======================================================
    */

    restoreExam(data) {

        this.stopTimer();


        if (!data) {

            return false;

        }


        this.exam =
            data instanceof Exam
                ? data
                : (
                    typeof Exam.fromJSON ===
                        "function"
                        ? Exam.fromJSON(
                            data
                        )
                        : new Exam(
                            data
                        )
                );


        if (!this.exam) {

            return false;

        }


        /*
        Recupera duração/tempo quando disponível.
        */

        this.duration =
            Number(
                this.exam.duration
            ) || 0;


        if (
            typeof this.exam
                .getRemainingTime ===
                "function"
        ) {

            this.remainingTime =
                Number(
                    this.exam
                        .getRemainingTime()
                ) || 0;

        } else {

            this.remainingTime =
                Number(
                    this.exam
                        .remainingTime
                ) || 0;

        }


        this.visitCurrentQuestion();


        this.emit(
            "examRestored",
            {

                exam:
                    this.exam

            }
        );


        this.emitState();


        return this.exam;

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    reset() {

        this.stopTimer();

        this.exam =
            null;

        this.remainingTime =
            0;

        this.duration =
            0;


        this.emit(
            "examReset",
            {}
        );


        return true;

    }


    /*
    ======================================================
    DESTROY
    ======================================================
    */

    destroy() {

        this.stopTimer();

        this.clearListeners();

        this.exam =
            null;

        this.questionManager =
            null;

        this.remainingTime =
            0;

        this.duration =
            0;

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.ExamEngine =
    ExamEngine;
