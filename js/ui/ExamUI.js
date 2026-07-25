/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
ExamUI

Responsabilidade:
- Integrar ExamEngine com a interface
- Controlar Start Screen
- Controlar Exam Screen
- Controlar botões Previous / Next
- Controlar Mark for Review
- Controlar Finish Exam
- Atualizar timer
- Atualizar navegação
- Atualizar renderização da questão
- Integrar ResultRenderer
- Integrar StorageManager
- Restaurar exame salvo
==========================================================
*/

class ExamUI {

    constructor(options = {}) {

        this.engine =
            options.engine || null;

        this.storageManager =
            options.storageManager || null;

        this.questionRenderer =
            options.questionRenderer || null;

        this.navigationRenderer =
            options.navigationRenderer || null;

        this.resultRenderer =
            options.resultRenderer || null;

        this.labRenderer =
            options.labRenderer || null;

        this.elements = {};

        this.listeners = [];

        this.timerInterval = null;

        this.initialized = false;

        this.cacheElements();

    }


    /*
    ======================================================
    ELEMENTOS
    ======================================================
    */

    cacheElements() {

        this.elements.startScreen =
            document.getElementById(
                "startScreen"
            );

        this.elements.examScreen =
            document.getElementById(
                "examScreen"
            );

        this.elements.resultScreen =
            document.getElementById(
                "resultScreen"
            );

        this.elements.startExamButton =
            document.getElementById(
                "startExamButton"
            );

        this.elements.resumeExamButton =
            document.getElementById(
                "resumeExamButton"
            );

        this.elements.previousButton =
            document.getElementById(
                "previousButton"
            );

        this.elements.nextButton =
            document.getElementById(
                "nextButton"
            );

        this.elements.reviewButton =
            document.getElementById(
                "reviewButton"
            );

        this.elements.finishButton =
            document.getElementById(
                "finishExamButton"
            );

        this.elements.timer =
            document.getElementById(
                "examTimer"
            );

        this.elements.currentQuestion =
            document.getElementById(
                "currentQuestionNumber"
            );

        this.elements.totalQuestions =
            document.getElementById(
                "totalQuestionCount"
            );

        this.elements.questionBankSize =
            document.getElementById(
                "questionBankSize"
            );

        this.elements.examTitle =
            document.getElementById(
                "examTitle"
            );

        this.elements.confirmModal =
            document.getElementById(
                "finishConfirmModal"
            );

        this.elements.confirmFinishButton =
            document.getElementById(
                "confirmFinishButton"
            );

        this.elements.cancelFinishButton =
            document.getElementById(
                "cancelFinishButton"
            );

        this.elements.finishSummary =
            document.getElementById(
                "finishSummary"
            );

    }


    /*
    ======================================================
    INICIALIZAÇÃO
    ======================================================
    */

    init() {

        if (this.initialized) {

            return;

        }


        if (!this.engine) {

            console.error(
                "ExamUI: ExamEngine is not available."
            );

            return;

        }


        /*
        --------------------------------------------------
        Liga os renderers ao engine
        --------------------------------------------------
        */

        if (
            this.questionRenderer &&
            typeof this.questionRenderer
                .setEngine === "function"
        ) {

            this.questionRenderer
                .setEngine(
                    this.engine
                );

        }


        if (
            this.navigationRenderer &&
            typeof this.navigationRenderer
                .setEngine === "function"
        ) {

            this.navigationRenderer
                .setEngine(
                    this.engine
                );

        }


        if (
            this.labRenderer &&
            typeof this.labRenderer
                .setEngine === "function"
        ) {

            this.labRenderer
                .setEngine(
                    this.engine
                );

        }


        if (
            this.resultRenderer &&
            typeof this.resultRenderer
                .setEngine === "function"
        ) {

            this.resultRenderer
                .setEngine(
                    this.engine
                );

        }


        /*
        --------------------------------------------------
        Liga LabRenderer ao QuestionRenderer
        --------------------------------------------------
        */

        if (
            this.questionRenderer &&
            this.labRenderer &&
            typeof this.questionRenderer
                .setLabRenderer === "function"
        ) {

            this.questionRenderer
                .setLabRenderer(
                    this.labRenderer
                );

        }


        /*
        --------------------------------------------------
        Callbacks do resultado
        --------------------------------------------------
        */

        if (
            this.resultRenderer
        ) {

            this.resultRenderer
                .setOnRestart(
                    () => {

                        this.returnToStart();

                    }
                );


            this.resultRenderer
                .setOnClose(
                    () => {

                        this.returnToStart();

                    }
                );

        }


        this.bindDOMEvents();

        this.bindEngineEvents();

        this.updateQuestionBankSize();

        this.configureResumeButton();

        this.showStartScreen();

        this.initialized = true;

    }


    /*
    ======================================================
    EVENTOS DO DOM
    ======================================================
    */

    bindDOMEvents() {

        /*
        START
        */

        if (
            this.elements.startExamButton
        ) {

            this.elements
                .startExamButton
                .addEventListener(
                    "click",
                    () => {

                        this.startExamFromUI();

                    }
                );

        }


        /*
        RESUME
        */

        if (
            this.elements.resumeExamButton
        ) {

            this.elements
                .resumeExamButton
                .addEventListener(
                    "click",
                    () => {

                        this.resumeExam();

                    }
                );

        }


        /*
        PREVIOUS
        */

        if (
            this.elements.previousButton
        ) {

            this.elements
                .previousButton
                .addEventListener(
                    "click",
                    () => {

                        this.engine
                            .previousQuestion();

                    }
                );

        }


        /*
        NEXT
        */

        if (
            this.elements.nextButton
        ) {

            this.elements
                .nextButton
                .addEventListener(
                    "click",
                    () => {

                        this.engine
                            .nextQuestion();

                    }
                );

        }


        /*
        REVIEW
        */

        if (
            this.elements.reviewButton
        ) {

            this.elements
                .reviewButton
                .addEventListener(
                    "click",
                    () => {

                        this.engine
                            .toggleReview();

                    }
                );

        }


        /*
        FINISH
        */

        if (
            this.elements.finishButton
        ) {

            this.elements
                .finishButton
                .addEventListener(
                    "click",
                    () => {

                        this.requestFinish();

                    }
                );

        }


        /*
        CONFIRMAR FINALIZAÇÃO
        */

        if (
            this.elements.confirmFinishButton
        ) {

            this.elements
                .confirmFinishButton
                .addEventListener(
                    "click",
                    () => {

                        this.closeFinishModal();

                        this.finishExam();

                    }
                );

        }


        /*
        CANCELAR FINALIZAÇÃO
        */

        if (
            this.elements.cancelFinishButton
        ) {

            this.elements
                .cancelFinishButton
                .addEventListener(
                    "click",
                    () => {

                        this.closeFinishModal();

                    }
                );

        }


        /*
        Clique fora do modal
        */

        if (
            this.elements.confirmModal
        ) {

            this.elements
                .confirmModal
                .addEventListener(
                    "click",
                    event => {

                        if (
                            event.target ===
                            this.elements
                                .confirmModal
                        ) {

                            this.closeFinishModal();

                        }

                    }
                );

        }


        /*
        ESC fecha modal
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape"
                ) {

                    this.closeFinishModal();

                }

            }
        );

    }


    /*
    ======================================================
    EVENTOS DO ENGINE
    ======================================================
    */

    bindEngineEvents() {

        const bind =
            (
                eventName,
                callback
            ) => {

                if (
                    typeof this.engine.on !==
                    "function"
                ) {

                    return;

                }


                const unsubscribe =
                    this.engine.on(
                        eventName,
                        callback
                    );


                if (
                    typeof unsubscribe ===
                    "function"
                ) {

                    this.listeners.push(
                        unsubscribe
                    );

                }

            };


        /*
        --------------------------------------------------
        Exame iniciado
        --------------------------------------------------
        */

        bind(
            "examStarted",
            () => {

                this.showExamScreen();

                this.renderExam();

                this.startTimer();

            }
        );


        /*
        --------------------------------------------------
        Questão mudou
        --------------------------------------------------
        */

        bind(
            "questionChanged",
            () => {

                this.renderCurrentQuestion();

                this.updateNavigation();

                this.updateControls();

            }
        );


        /*
        --------------------------------------------------
        Resposta mudou
        --------------------------------------------------
        */

        bind(
            "answerChanged",
            () => {

                this.updateNavigation();

                this.updateControls();

            }
        );


        /*
        --------------------------------------------------
        Review
        --------------------------------------------------
        */

        bind(
            "reviewChanged",
            () => {

                this.updateNavigation();

                this.updateControls();

            }
        );


        /*
        --------------------------------------------------
        Timer
        --------------------------------------------------
        */

        bind(
            "timeChanged",
            () => {

                this.updateTimer();

            }
        );


        /*
        --------------------------------------------------
        Exame pausado
        --------------------------------------------------
        */

        bind(
            "examPaused",
            () => {

                this.updateTimer();

            }
        );


        /*
        --------------------------------------------------
        Exame retomado
        --------------------------------------------------
        */

        bind(
            "examResumed",
            () => {

                this.showExamScreen();

                this.renderExam();

                this.startTimer();

            }
        );


        /*
        --------------------------------------------------
        Exame finalizado
        --------------------------------------------------
        */

        bind(
            "examFinished",
            payload => {

                this.stopTimer();

                this.handleExamFinished(
                    payload
                );

            }
        );

    }


    /*
    ======================================================
    INICIAR EXAME PELA TELA
    ======================================================
    */

    startExamFromUI() {

        const selected =
            document.querySelector(
                'input[name="examMode"]:checked'
            );


        let questionCount =
            selected
                ? Number(
                    selected.value
                )
                : 20;


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
        Tempo do exame

        Pode ser informado no próprio radio através de:

        data-minutes="30"
        --------------------------------------------------
        */

        let durationMinutes =
            selected
                ? Number(
                    selected.dataset
                        .minutes
                )
                : 0;


        if (
            !Number.isFinite(
                durationMinutes
            ) ||
            durationMinutes <= 0
        ) {

            durationMinutes =
                this.getDefaultDuration(
                    questionCount
                );

        }


        /*
        --------------------------------------------------
        Remove sessão anterior
        --------------------------------------------------
        */

        if (
            this.storageManager
        ) {

            this.storageManager
                .clearExam();

        }


        /*
        --------------------------------------------------
        Inicia através do engine
        --------------------------------------------------
        */

        try {

            this.engine.startExam({

                questionCount:
                    questionCount,

                duration:
                    durationMinutes * 60

            });


            /*
            ------------------------------------------------
            Fallback

            Caso o ExamEngine não dispare examStarted,
            a interface ainda é aberta.
            ------------------------------------------------
            */

            this.showExamScreen();

            this.renderExam();

            this.startTimer();


            /*
            ------------------------------------------------
            Autosave
            ------------------------------------------------
            */

            if (
                this.storageManager
            ) {

                this.storageManager
                    .enableAutoSave(
                        this.engine
                    );

            }

        } catch (error) {

            console.error(
                "Unable to start exam.",
                error
            );

        }

    }


    /*
    ======================================================
    DURAÇÃO PADRÃO
    ======================================================
    */

    getDefaultDuration(
        questionCount
    ) {

        if (
            questionCount <= 20
        ) {

            return 30;

        }


        if (
            questionCount <= 45
        ) {

            return 60;

        }


        if (
            questionCount <= 90
        ) {

            return 120;

        }


        return Math.ceil(
            questionCount * 1.35
        );

    }


    /*
    ======================================================
    RESTAURAR EXAME
    ======================================================
    */

    resumeExam() {

        if (
            !this.storageManager
        ) {

            return false;

        }


        const restored =
            this.storageManager
                .restoreEngine(
                    this.engine
                );


        if (!restored) {

            this.configureResumeButton();

            return false;

        }


        this.showExamScreen();

        this.renderExam();

        this.startTimer();


        this.storageManager
            .enableAutoSave(
                this.engine
            );


        return true;

    }


    /*
    ======================================================
    BOTÃO RESUME
    ======================================================
    */

    configureResumeButton() {

        if (
            !this.elements.resumeExamButton
        ) {

            return;

        }


        if (
            !this.storageManager ||
            !this.storageManager
                .hasSavedExam()
        ) {

            this.elements
                .resumeExamButton
                .classList.add(
                    "hidden"
                );


            return;

        }


        const info =
            this.storageManager
                .getSavedExamInfo();


        if (
            !info ||
            info.finished
        ) {

            this.elements
                .resumeExamButton
                .classList.add(
                    "hidden"
                );


            return;

        }


        this.elements
            .resumeExamButton
            .classList.remove(
                "hidden"
            );


        this.elements
            .resumeExamButton
            .textContent =
            "RESUME EXAM";

    }


    /*
    ======================================================
    BANCO DE QUESTÕES
    ======================================================
    */

    updateQuestionBankSize() {

        if (
            !this.elements.questionBankSize
        ) {

            return;

        }


        let size = 0;


        /*
        --------------------------------------------------
        Tenta obter do engine
        --------------------------------------------------
        */

        if (
            this.engine &&
            typeof this.engine
                .getQuestionBankSize ===
                "function"
        ) {

            size =
                this.engine
                    .getQuestionBankSize();

        }


        /*
        --------------------------------------------------
        Tenta obter do QuestionManager
        --------------------------------------------------
        */

        if (
            !size &&
            this.engine &&
            typeof this.engine
                .getQuestionManager ===
                "function"
        ) {

            const manager =
                this.engine
                    .getQuestionManager();


            if (
                manager &&
                typeof manager
                    .getTotalQuestions ===
                    "function"
            ) {

                size =
                    manager
                        .getTotalQuestions();

            }

        }


        this.elements
            .questionBankSize
            .textContent =
            Number(size) || 0;

    }


    /*
    ======================================================
    RENDER EXAME
    ======================================================
    */

    renderExam() {

        const exam =
            this.engine.getExam();


        if (!exam) {

            return;

        }


        /*
        --------------------------------------------------
        Título
        --------------------------------------------------
        */

        if (
            this.elements.examTitle
        ) {

            this.elements
                .examTitle
                .textContent =
                exam.title ||
                "Cisco CCNA 200-301";

        }


        /*
        --------------------------------------------------
        Total
        --------------------------------------------------
        */

        if (
            this.elements.totalQuestions
        ) {

            this.elements
                .totalQuestions
                .textContent =
                exam.getTotalQuestions();

        }


        this.renderCurrentQuestion();

        this.updateNavigation();

        this.updateControls();

        this.updateTimer();

    }


    /*
    ======================================================
    QUESTÃO ATUAL
    ======================================================
    */

    renderCurrentQuestion() {

        const question =
            this.engine
                .getCurrentQuestion();


        if (!question) {

            return;

        }


        /*
        Marca como visitada.
        */

        if (
            typeof question.visit ===
            "function"
        ) {

            question.visit();

        }


        if (
            this.questionRenderer
        ) {

            this.questionRenderer
                .render(
                    question
                );

        }


        const exam =
            this.engine.getExam();


        if (
            exam &&
            this.elements
                .currentQuestion
        ) {

            this.elements
                .currentQuestion
                .textContent =
                exam.getCurrentIndex() + 1;

        }

    }


    /*
    ======================================================
    NAVEGAÇÃO
    ======================================================
    */

    updateNavigation() {

        if (
            !this.navigationRenderer
        ) {

            return;

        }


        if (
            typeof this.navigationRenderer
                .updateStates ===
                "function"
        ) {

            this.navigationRenderer
                .updateStates();

        } else {

            this.navigationRenderer
                .render();

        }

    }


    /*
    ======================================================
    CONTROLES
    ======================================================
    */

    updateControls() {

        const exam =
            this.engine.getExam();


        if (!exam) {

            return;

        }


        const index =
            exam.getCurrentIndex();


        const total =
            exam.getTotalQuestions();


        /*
        --------------------------------------------------
        Previous
        --------------------------------------------------
        */

        if (
            this.elements.previousButton
        ) {

            this.elements
                .previousButton
                .disabled =
                index <= 0;

        }


        /*
        --------------------------------------------------
        Next
        --------------------------------------------------
        */

        if (
            this.elements.nextButton
        ) {

            this.elements
                .nextButton
                .disabled =
                index >= total - 1;

        }


        /*
        --------------------------------------------------
        Review
        --------------------------------------------------
        */

        const question =
            this.engine
                .getCurrentQuestion();


        if (
            this.elements.reviewButton &&
            question
        ) {

            const marked =
                question
                    .isMarkedForReview();


            this.elements
                .reviewButton
                .classList.toggle(
                    "active",
                    marked
                );


            this.elements
                .reviewButton
                .textContent =
                marked
                    ? "MARKED FOR REVIEW"
                    : "MARK FOR REVIEW";

        }

    }


    /*
    ======================================================
    TIMER
    ======================================================
    */

    startTimer() {

        this.stopTimer();


        this.updateTimer();


        /*
        --------------------------------------------------
        O engine continua sendo a fonte oficial do tempo.

        Este intervalo serve apenas para atualizar a tela.
        --------------------------------------------------
        */

        this.timerInterval =
            window.setInterval(
                () => {

                    this.updateTimer();

                },
                1000
            );

    }


    stopTimer() {

        if (
            this.timerInterval !==
            null
        ) {

            window.clearInterval(
                this.timerInterval
            );

        }


        this.timerInterval =
            null;

    }


    updateTimer() {

        if (
            !this.elements.timer
        ) {

            return;

        }


        const exam =
            this.engine.getExam();


        if (!exam) {

            this.elements
                .timer
                .textContent =
                "00:00";

            return;

        }


        let seconds = 0;


        if (
            typeof exam
                .getRemainingTime ===
                "function"
        ) {

            seconds =
                exam.getRemainingTime();

        } else if (
            Number.isFinite(
                exam.remainingTime
            )
        ) {

            seconds =
                exam.remainingTime;

        }


        seconds =
            Math.max(
                0,
                Math.floor(
                    Number(seconds) || 0
                )
            );


        this.elements
            .timer
            .textContent =
            this.formatTime(
                seconds
            );


        /*
        --------------------------------------------------
        Estados visuais do timer
        --------------------------------------------------
        */

        this.elements
            .timer
            .classList.remove(
                "warning",
                "danger"
            );


        if (
            seconds <= 300 &&
            seconds > 60
        ) {

            this.elements
                .timer
                .classList.add(
                    "warning"
                );

        }


        if (
            seconds <= 60
        ) {

            this.elements
                .timer
                .classList.add(
                    "danger"
                );

        }

    }


    /*
    ======================================================
    SOLICITAR FINALIZAÇÃO
    ======================================================
    */

    requestFinish() {

        const exam =
            this.engine.getExam();


        if (!exam) {

            return;

        }


        const statistics =
            exam.getStatistics();


        /*
        --------------------------------------------------
        Resumo no modal
        --------------------------------------------------
        */

        if (
            this.elements.finishSummary
        ) {

            this.elements
                .finishSummary
                .innerHTML =
                `
                <strong>${statistics.answered}</strong>
                answered &nbsp;•&nbsp;
                <strong>${statistics.unanswered}</strong>
                unanswered &nbsp;•&nbsp;
                <strong>${statistics.review}</strong>
                marked for review
                `;

        }


        /*
        --------------------------------------------------
        Se existe modal, abre.
        Caso contrário usa confirm nativo.
        --------------------------------------------------
        */

        if (
            this.elements.confirmModal
        ) {

            this.openFinishModal();

            return;

        }


        const message =
            statistics.unanswered > 0
                ? `You still have ${statistics.unanswered} unanswered question(s). Finish the exam?`
                : "Finish the exam?";


        if (
            window.confirm(
                message
            )
        ) {

            this.finishExam();

        }

    }


    /*
    ======================================================
    FINALIZAR
    ======================================================
    */

    finishExam() {

        try {

            this.stopTimer();


            /*
            ------------------------------------------------
            O ExamEngine calcula o resultado.
            ------------------------------------------------
            */

            const result =
                this.engine
                    .finishExam();


            /*
            ------------------------------------------------
            Caso o engine retorne diretamente o resultado,
            renderiza imediatamente.

            Caso dispare examFinished, o listener também
            tratará o resultado.
            ------------------------------------------------
            */

            if (result) {

                this.handleExamFinished({

                    result:
                        result

                });

            }

        } catch (error) {

            console.error(
                "Unable to finish exam.",
                error
            );

        }

    }


    /*
    ======================================================
    EXAME FINALIZADO
    ======================================================
    */

    handleExamFinished(payload) {

        this.stopTimer();


        let result =
            payload &&
            payload.result
                ? payload.result
                : null;


        /*
        --------------------------------------------------
        Fallback para resultado armazenado no Exam.
        --------------------------------------------------
        */

        if (!result) {

            const exam =
                this.engine.getExam();


            if (
                exam &&
                typeof exam.getResult ===
                "function"
            ) {

                result =
                    exam.getResult();

            }

        }


        if (!result) {

            console.error(
                "Exam finished without a result."
            );

            return;

        }


        /*
        --------------------------------------------------
        Storage
        --------------------------------------------------
        */

        if (
            this.storageManager
        ) {

            this.storageManager
                .saveResult(
                    result
                );


            this.storageManager
                .clearExam();


            this.storageManager
                .disableAutoSave();

        }


        /*
        --------------------------------------------------
        Fecha modal
        --------------------------------------------------
        */

        this.closeFinishModal();


        /*
        --------------------------------------------------
        Esconde exame
        --------------------------------------------------
        */

        this.hideElement(
            this.elements.examScreen
        );


        /*
        --------------------------------------------------
        Resultado
        --------------------------------------------------
        */

        if (
            this.resultRenderer
        ) {

            this.resultRenderer
                .render(
                    result
                );

        }

    }


    /*
    ======================================================
    MODAL
    ======================================================
    */

    openFinishModal() {

        if (
            !this.elements.confirmModal
        ) {

            return;

        }


        this.elements
            .confirmModal
            .classList.remove(
                "hidden"
            );


        this.elements
            .confirmModal
            .classList.add(
                "active"
            );


        document.body
            .classList.add(
                "modal-open"
            );

    }


    closeFinishModal() {

        if (
            !this.elements.confirmModal
        ) {

            return;

        }


        this.elements
            .confirmModal
            .classList.remove(
                "active"
            );


        this.elements
            .confirmModal
            .classList.add(
                "hidden"
            );


        document.body
            .classList.remove(
                "modal-open"
            );

    }


    /*
    ======================================================
    START SCREEN
    ======================================================
    */

    showStartScreen() {

        this.showElement(
            this.elements.startScreen
        );


        this.hideElement(
            this.elements.examScreen
        );


        this.hideElement(
            this.elements.resultScreen
        );


        this.closeFinishModal();

    }


    /*
    ======================================================
    EXAM SCREEN
    ======================================================
    */

    showExamScreen() {

        this.hideElement(
            this.elements.startScreen
        );


        this.hideElement(
            this.elements.resultScreen
        );


        this.showElement(
            this.elements.examScreen
        );


        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

    }


    /*
    ======================================================
    VOLTAR AO INÍCIO
    ======================================================
    */

    returnToStart() {

        this.stopTimer();


        if (
            this.storageManager
        ) {

            this.storageManager
                .disableAutoSave();

        }


        if (
            this.resultRenderer
        ) {

            this.resultRenderer
                .clear();

        }


        if (
            this.questionRenderer
        ) {

            this.questionRenderer
                .clear();

        }


        if (
            this.navigationRenderer
        ) {

            this.navigationRenderer
                .clear();

        }


        if (
            this.labRenderer
        ) {

            this.labRenderer
                .clear();

        }


        this.configureResumeButton();

        this.showStartScreen();

    }


    /*
    ======================================================
    SHOW / HIDE
    ======================================================
    */

    showElement(element) {

        if (!element) {

            return;

        }


        element.classList.remove(
            "hidden"
        );


        element.classList.add(
            "active"
        );

    }


    hideElement(element) {

        if (!element) {

            return;

        }


        element.classList.remove(
            "active"
        );


        element.classList.add(
            "hidden"
        );

    }


    /*
    ======================================================
    TEMPO
    ======================================================
    */

    formatTime(seconds) {

        seconds =
            Math.max(
                0,
                Math.floor(
                    Number(seconds) || 0
                )
            );


        const hours =
            Math.floor(
                seconds / 3600
            );


        const minutes =
            Math.floor(
                (seconds % 3600) /
                60
            );


        const remainingSeconds =
            seconds % 60;


        if (
            hours > 0
        ) {

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


        return (
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
    DESTROY
    ======================================================
    */

    destroy() {

        this.stopTimer();


        this.listeners.forEach(
            unsubscribe => {

                try {

                    if (
                        typeof unsubscribe ===
                        "function"
                    ) {

                        unsubscribe();

                    }

                } catch (error) {

                    console.warn(
                        error
                    );

                }

            }
        );


        this.listeners = [];


        if (
            this.storageManager
        ) {

            this.storageManager
                .disableAutoSave();

        }


        this.initialized =
            false;

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.ExamUI =
    ExamUI;
