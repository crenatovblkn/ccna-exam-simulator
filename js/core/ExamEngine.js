/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
ExamEngine

Motor central do simulador.

Responsabilidade:
- Criar sessões de exame
- Definir modos de prova
- Selecionar questões
- Controlar navegação
- Controlar respostas
- Controlar revisão
- Controlar cronômetro
- Finalizar prova
- Expor estatísticas
- Disparar eventos para a interface

Este componente NÃO renderiza HTML diretamente.
==========================================================
*/

class ExamEngine {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor(questionManager = null) {

        this.questionManager =
            questionManager ||
            new QuestionManager();


        this.exam = null;


        /*
        --------------------------------------------------
        Timer
        --------------------------------------------------
        */

        this.timerInterval = null;

        this.timerRunning = false;

        this.lastTickTime = null;


        /*
        --------------------------------------------------
        Eventos
        --------------------------------------------------
        */

        this.listeners = {};


        /*
        --------------------------------------------------
        Configurações padrão
        --------------------------------------------------
        */

        this.config = {

            title:
                "Cisco CCNA 200-301",

            domain:
                "Network Fundamentals",

            passingScore:
                70,

            autoSave:
                true,

            timerInterval:
                1000

        };


        /*
        --------------------------------------------------
        Modos de exame

        duration em segundos.
        --------------------------------------------------
        */

        this.examModes = {

            practice: {

                id:
                    "practice",

                name:
                    "Quick Practice",

                questions:
                    20,

                duration:
                    30 * 60

            },


            standard: {

                id:
                    "standard",

                name:
                    "Standard Exam",

                questions:
                    45,

                duration:
                    60 * 60

            },


            full: {

                id:
                    "full",

                name:
                    "Full Exam",

                questions:
                    90,

                duration:
                    120 * 60

            }

        };

    }


    /*
    ======================================================
    CONFIGURAÇÃO
    ======================================================
    */

    configure(options = {}) {

        if (
            !options ||
            typeof options !== "object"
        ) {

            return;

        }


        this.config = {

            ...this.config,
            ...options

        };

    }


    /*
    ======================================================
    QUESTION MANAGER
    ======================================================
    */

    setQuestionManager(
        questionManager
    ) {

        if (
            !(
                questionManager instanceof
                QuestionManager
            )
        ) {

            throw new Error(
                "Invalid QuestionManager."
            );

        }


        this.questionManager =
            questionManager;

    }


    getQuestionManager() {

        return this.questionManager;

    }


    /*
    ======================================================
    MODOS DE EXAME
    ======================================================
    */

    getExamModes() {

        return {
            ...this.examModes
        };

    }


    getExamMode(mode) {

        return (
            this.examModes[mode] ||
            null
        );

    }


    /*
    ======================================================
    CRIAR EXAME
    ======================================================
    */

    createExam(options = {}) {

        if (
            !this.questionManager ||
            !this.questionManager.isLoaded()
        ) {

            throw new Error(
                "Question bank is not loaded."
            );

        }


        if (
            this.questionManager.getCount() === 0
        ) {

            throw new Error(
                "Question bank is empty."
            );

        }


        /*
        --------------------------------------------------
        Modo
        --------------------------------------------------
        */

        const modeId =
            options.mode ||
            "practice";


        const mode =
            this.getExamMode(
                modeId
            );


        if (!mode) {

            throw new Error(
                `Unknown exam mode: ${modeId}`
            );

        }


        /*
        --------------------------------------------------
        Quantidade
        --------------------------------------------------
        */

        const requestedCount =
            Number.isInteger(
                options.questions
            )
                ? options.questions
                : mode.questions;


        const available =
            this.questionManager
                .filter({

                    domain:
                        options.domain ||
                        this.config.domain

                })
                .length;


        const questionCount =
            Math.min(
                requestedCount,
                available
            );


        if (
            questionCount <= 0
        ) {

            throw new Error(
                "No questions are available for the selected domain."
            );

        }


        /*
        --------------------------------------------------
        Seleção das questões
        --------------------------------------------------
        */

        let selectedQuestions;


        if (
            options.distribution &&
            typeof options.distribution ===
                "object"
        ) {

            selectedQuestions =
                this.questionManager
                    .selectBalanced(
                        options.distribution,
                        {

                            domain:
                                options.domain ||
                                this.config.domain,

                            difficulty:
                                options.difficulty,

                            shuffle:
                                true

                        }
                    );


            selectedQuestions =
                this.questionManager
                    .fillSelection(
                        selectedQuestions,
                        questionCount,
                        {

                            domain:
                                options.domain ||
                                this.config.domain,

                            difficulty:
                                options.difficulty,

                            shuffle:
                                true

                        }
                    );

        } else {

            selectedQuestions =
                this.questionManager
                    .selectQuestions({

                        domain:
                            options.domain ||
                            this.config.domain,

                        difficulty:
                            options.difficulty,

                        count:
                            questionCount,

                        shuffle:
                            options.shuffle !==
                            false

                    });

        }


        /*
        --------------------------------------------------
        Duração
        --------------------------------------------------
        */

        const duration =
            Number.isFinite(
                options.duration
            )
                ? Math.max(
                    0,
                    options.duration
                )
                : mode.duration;


        /*
        --------------------------------------------------
        Cria sessão
        --------------------------------------------------
        */

        this.exam =
            new Exam({

                title:
                    options.title ||
                    this.config.title,

                domain:
                    options.domain ||
                    this.config.domain,

                mode:
                    modeId,

                questions:
                    selectedQuestions,

                duration:
                    duration,

                remainingTime:
                    duration

            });


        this.emit(
            "examCreated",
            {

                exam:
                    this.exam,

                mode:
                    mode,

                totalQuestions:
                    this.exam
                        .getTotalQuestions()

            }
        );


        return this.exam;

    }


    /*
    ======================================================
    INICIAR EXAME
    ======================================================
    */

    startExam() {

        if (!this.exam) {

            throw new Error(
                "Exam has not been created."
            );

        }


        if (
            this.exam.isFinished()
        ) {

            return false;

        }


        const started =
            this.exam.start();


        if (!started) {

            return false;

        }


        this.startTimer();


        this.emit(
            "examStarted",
            {

                exam:
                    this.exam,

                question:
                    this.exam
                        .getCurrentQuestion(),

                index:
                    this.exam
                        .getCurrentIndex()

            }
        );


        this.emitState();


        return true;

    }


    /*
    ======================================================
    CRIAR E INICIAR
    ======================================================
    */

    begin(options = {}) {

        this.stopTimer();

        this.createExam(options);

        this.startExam();


        return this.exam;

    }


    /*
    ======================================================
    EXAME ATUAL
    ======================================================
    */

    getExam() {

        return this.exam;

    }


    getCurrentQuestion() {

        if (!this.exam) {

            return null;

        }


        return this.exam
            .getCurrentQuestion();

    }


    getCurrentIndex() {

        if (!this.exam) {

            return 0;

        }


        return this.exam
            .getCurrentIndex();

    }


    /*
    ======================================================
    NAVEGAÇÃO
    ======================================================
    */

    goToQuestion(index) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const changed =
            this.exam
                .goToQuestion(index);


        if (!changed) {

            return false;

        }


        this.emitQuestionChange();

        return true;

    }


    nextQuestion() {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const changed =
            this.exam
                .nextQuestion();


        if (!changed) {

            return false;

        }


        this.emitQuestionChange();

        return true;

    }


    previousQuestion() {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const changed =
            this.exam
                .previousQuestion();


        if (!changed) {

            return false;

        }


        this.emitQuestionChange();

        return true;

    }


    /*
    ======================================================
    RESPOSTA SINGLE / MULTIPLE
    ======================================================
    */

    answer(answerId) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        const changed =
            question.answer(
                answerId
            );


        if (!changed) {

            return false;

        }


        this.emit(
            "answerChanged",
            {

                question:
                    question,

                index:
                    this.getCurrentIndex(),

                userAnswers:
                    question
                        .getUserAnswers()

            }
        );


        this.emitState();

        return true;

    }


    /*
    ======================================================
    DEFINE RESPOSTAS
    ======================================================
    */

    setAnswers(answerIds = []) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        const changed =
            question.setAnswers(
                answerIds
            );


        if (!changed) {

            return false;

        }


        this.emit(
            "answerChanged",
            {

                question:
                    question,

                index:
                    this.getCurrentIndex(),

                userAnswers:
                    question
                        .getUserAnswers()

            }
        );


        this.emitState();

        return true;

    }


    /*
    ======================================================
    LIMPAR RESPOSTA
    ======================================================
    */

    clearAnswer() {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        switch (
            question.getType()
        ) {

            case "single":

            case "multiple":

            case "cli":

            case "exhibit":

                question.clearAnswers();

                break;


            case "dragdrop":

                question.clearDragdrop();

                break;


            case "matching":

                question.clearMatching();

                break;


            case "ordering":

                question.clearOrder();

                break;


            case "lab":

                question.clearLabState();

                break;


            default:

                return false;

        }


        this.emit(
            "answerChanged",
            {

                question:
                    question,

                index:
                    this.getCurrentIndex()

            }
        );


        this.emitState();

        return true;

    }


    /*
    ======================================================
    DRAG AND DROP
    ======================================================
    */

    setDragdropAnswer(
        targetId,
        itemId
    ) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            !question.isDragDrop()
        ) {

            return false;

        }


        const changed =
            question
                .setDragdropAnswer(
                    targetId,
                    itemId
                );


        if (changed) {

            this.emitAnswerChanged(
                question
            );

        }


        return changed;

    }


    removeDragdropAnswer(
        targetId
    ) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            !question.isDragDrop()
        ) {

            return false;

        }


        question
            .removeDragdropAnswer(
                targetId
            );


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

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            !question.isMatching()
        ) {

            return false;

        }


        const changed =
            question
                .setMatchingAnswer(
                    leftId,
                    rightId
                );


        if (changed) {

            this.emitAnswerChanged(
                question
            );

        }


        return changed;

    }


    /*
    ======================================================
    ORDERING
    ======================================================
    */

    setOrder(order = []) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            !question.isOrdering()
        ) {

            return false;

        }


        const changed =
            question.setOrder(order);


        if (changed) {

            this.emitAnswerChanged(
                question
            );

        }


        return changed;

    }


    moveOrderItem(
        fromIndex,
        toIndex
    ) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            !question.isOrdering()
        ) {

            return false;

        }


        const changed =
            question
                .moveOrderItem(
                    fromIndex,
                    toIndex
                );


        if (changed) {

            this.emitAnswerChanged(
                question
            );

        }


        return changed;

    }


    /*
    ======================================================
    LAB
    ======================================================
    */

    setLabState(state = {}) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            !question.isLab()
        ) {

            return false;

        }


        const changed =
            question
                .setLabState(
                    state
                );


        if (changed) {

            this.emitAnswerChanged(
                question
            );

        }


        return changed;

    }


    updateLabState(
        key,
        value
    ) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (
            !question ||
            !question.isLab()
        ) {

            return false;

        }


        const changed =
            question
                .updateLabState(
                    key,
                    value
                );


        if (changed) {

            this.emitAnswerChanged(
                question
            );

        }


        return changed;

    }


    /*
    ======================================================
    REVISÃO
    ======================================================
    */

    toggleReview() {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        const review =
            question.toggleReview();


        this.emit(
            "reviewChanged",
            {

                question:
                    question,

                index:
                    this.getCurrentIndex(),

                review:
                    review

            }
        );


        this.emitState();


        return review;

    }


    setReview(value = true) {

        if (
            !this.canInteract()
        ) {

            return false;

        }


        const question =
            this.getCurrentQuestion();


        if (!question) {

            return false;

        }


        const review =
            question.setReview(
                value
            );


        this.emit(
            "reviewChanged",
            {

                question:
                    question,

                index:
                    this.getCurrentIndex(),

                review:
                    review

            }
        );


        this.emitState();


        return review;

    }


    /*
    ======================================================
    TIMER
    ======================================================
    */

    startTimer() {

        this.stopTimer();


        if (
            !this.exam ||
            this.exam.isFinished()
        ) {

            return false;

        }


        this.timerRunning = true;

        this.lastTickTime =
            Date.now();


        this.timerInterval =
            window.setInterval(
                () => {

                    this.processTimer();

                },
                this.config.timerInterval
            );


        this.emitTimer();


        return true;

    }


    /*
    ======================================================
    PROCESSAMENTO DO TIMER
    ======================================================
    */

    processTimer() {

        if (
            !this.exam ||
            !this.timerRunning
        ) {

            return;

        }


        if (
            this.exam.isFinished()
        ) {

            this.stopTimer();

            return;

        }


        if (
            this.exam.isPaused()
        ) {

            this.lastTickTime =
                Date.now();

            return;

        }


        const now =
            Date.now();


        const difference =
            now -
            this.lastTickTime;


        const elapsedSeconds =
            Math.floor(
                difference / 1000
            );


        if (
            elapsedSeconds < 1
        ) {

            return;

        }


        this.lastTickTime +=
            elapsedSeconds * 1000;


        this.exam.tick(
            elapsedSeconds
        );


        this.emitTimer();


        /*
        --------------------------------------------------
        Exam.tick() finaliza automaticamente
        quando o tempo chega a zero.
        --------------------------------------------------
        */

        if (
            this.exam.isFinished()
        ) {

            this.stopTimer();


            this.emit(
                "timeExpired",
                {

                    exam:
                        this.exam,

                    result:
                        this.exam
                            .getResult()

                }
            );


            this.emit(
                "examFinished",
                {

                    exam:
                        this.exam,

                    result:
                        this.exam
                            .getResult()

                }
            );


            this.emitState();

        }

    }


    /*
    ======================================================
    PARAR TIMER
    ======================================================
    */

    stopTimer() {

        if (
            this.timerInterval !==
            null
        ) {

            window.clearInterval(
                this.timerInterval
            );

        }


        this.timerInterval = null;

        this.timerRunning = false;

        this.lastTickTime = null;

    }


    /*
    ======================================================
    PAUSAR EXAME
    ======================================================
    */

    pauseExam() {

        if (!this.exam) {

            return false;

        }


        const paused =
            this.exam.pause();


        if (paused) {

            this.emit(
                "examPaused",
                {

                    exam:
                        this.exam

                }
            );

        }


        return paused;

    }


    /*
    ======================================================
    CONTINUAR EXAME
    ======================================================
    */

    resumeExam() {

        if (!this.exam) {

            return false;

        }


        const resumed =
            this.exam.resume();


        if (resumed) {

            this.lastTickTime =
                Date.now();


            this.emit(
                "examResumed",
                {

                    exam:
                        this.exam

                }
            );

        }


        return resumed;

    }


    /*
    ======================================================
    FINALIZAR EXAME
    ======================================================
    */

    finishExam(
        reason = "user"
    ) {

        if (!this.exam) {

            return null;

        }


        if (
            this.exam.isFinished()
        ) {

            return this.exam
                .getResult();

        }


        this.stopTimer();


        const result =
            this.exam.finish(
                reason
            );


        /*
        --------------------------------------------------
        Adiciona informação de aprovação.
        --------------------------------------------------
        */

        result.passingScore =
            this.config.passingScore;


        result.passed =
            result.score >=
            this.config.passingScore;


        this.emit(
            "examFinished",
            {

                exam:
                    this.exam,

                result:
                    result

            }
        );


        this.emitState();


        return result;

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    resetExam() {

        this.stopTimer();


        if (!this.exam) {

            return false;

        }


        this.exam.reset();


        this.emit(
            "examReset",
            {

                exam:
                    this.exam

            }
        );


        this.emitState();


        return true;

    }


    /*
    ======================================================
    DESTRUIR SESSÃO
    ======================================================
    */

    destroyExam() {

        this.stopTimer();

        this.exam = null;


        this.emit(
            "examDestroyed",
            {}
        );

    }


    /*
    ======================================================
    PODE INTERAGIR?
    ======================================================
    */

    canInteract() {

        return Boolean(

            this.exam &&

            this.exam.isStarted() &&

            !this.exam.isFinished()

        );

    }


    /*
    ======================================================
    ESTATÍSTICAS
    ======================================================
    */

    getStatistics() {

        if (!this.exam) {

            return {

                total:
                    0,

                answered:
                    0,

                unanswered:
                    0,

                review:
                    0,

                correct:
                    0,

                incorrect:
                    0,

                progress:
                    0

            };

        }


        return this.exam
            .getStatistics();

    }


    /*
    ======================================================
    ESTADO COMPLETO
    ======================================================
    */

    getState() {

        if (!this.exam) {

            return {

                active:
                    false,

                exam:
                    null

            };

        }


        return {

            active:
                this.canInteract(),

            started:
                this.exam
                    .isStarted(),

            finished:
                this.exam
                    .isFinished(),

            paused:
                this.exam
                    .isPaused(),

            currentIndex:
                this.exam
                    .getCurrentIndex(),

            currentQuestion:
                this.exam
                    .getCurrentQuestion(),

            totalQuestions:
                this.exam
                    .getTotalQuestions(),

            remainingTime:
                this.exam
                    .getRemainingTime(),

            formattedRemainingTime:
                this.exam
                    .getFormattedRemainingTime(),

            statistics:
                this.exam
                    .getStatistics()

        };

    }


    /*
    ======================================================
    EMISSÃO DE MUDANÇA DE QUESTÃO
    ======================================================
    */

    emitQuestionChange() {

        this.emit(
            "questionChanged",
            {

                question:
                    this.getCurrentQuestion(),

                index:
                    this.getCurrentIndex(),

                total:
                    this.exam
                        .getTotalQuestions()

            }
        );


        this.emitState();

    }


    /*
    ======================================================
    EMISSÃO DE ALTERAÇÃO DE RESPOSTA
    ======================================================
    */

    emitAnswerChanged(question) {

        this.emit(
            "answerChanged",
            {

                question:
                    question,

                index:
                    this.getCurrentIndex()

            }
        );


        this.emitState();

    }


    /*
    ======================================================
    EMISSÃO DO TIMER
    ======================================================
    */

    emitTimer() {

        if (!this.exam) {

            return;

        }


        this.emit(
            "timer",
            {

                remainingTime:
                    this.exam
                        .getRemainingTime(),

                elapsedTime:
                    this.exam
                        .getElapsedTime(),

                formatted:
                    this.exam
                        .getFormattedRemainingTime()

            }
        );

    }


    /*
    ======================================================
    EMISSÃO DO ESTADO
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
            typeof callback !==
            "function"
        ) {

            return () => {};

        }


        if (
            !this.listeners[
                eventName
            ]
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


        /*
        --------------------------------------------------
        Retorna função para remover listener.
        --------------------------------------------------
        */

        return () => {

            this.off(
                eventName,
                callback
            );

        };

    }


    /*
    ======================================================
    REMOVER EVENTO
    ======================================================
    */

    off(
        eventName,
        callback
    ) {

        if (
            !this.listeners[
                eventName
            ]
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


    /*
    ======================================================
    DISPARAR EVENTO
    ======================================================
    */

    emit(
        eventName,
        payload = {}
    ) {

        const listeners =
            this.listeners[
                eventName
            ];


        if (
            !Array.isArray(listeners)
        ) {

            return;

        }


        listeners.forEach(
            listener => {

                try {

                    listener(
                        payload
                    );

                } catch (error) {

                    console.error(
                        `ExamEngine event error (${eventName}):`,
                        error
                    );

                }

            }
        );

    }


    /*
    ======================================================
    LIMPAR EVENTOS
    ======================================================
    */

    clearListeners() {

        this.listeners = {};

    }


    /*
    ======================================================
    RESTAURAR EXAME

    Será utilizado posteriormente pelo StorageManager.
    ======================================================
    */

    restoreExam(data) {

        this.stopTimer();


        this.exam =
            data instanceof Exam
                ? data
                : Exam.fromJSON(
                    data
                );


        this.emit(
            "examRestored",
            {

                exam:
                    this.exam

            }
        );


        if (
            this.exam.isStarted() &&
            !this.exam.isFinished() &&
            !this.exam.isPaused()
        ) {

            this.startTimer();

        }


        this.emitState();


        return this.exam;

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.ExamEngine =
    ExamEngine;
