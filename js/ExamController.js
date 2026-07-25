/*
==========================================================
CCNA Exam Simulator
Exam Controller

Arquivo: js/ExamController.js
==========================================================
*/

class ExamController {

    constructor(config = {}) {

        /*
        ==================================================
        CONFIGURAÇÃO
        ==================================================
        */

        this.config = {

            questionBankPath:
                config.questionBankPath ||
                "data/network-fundamentals.json",

            defaultQuestionCount:
                config.defaultQuestionCount || 20,

            defaultDuration:
                config.defaultDuration || 30

        };


        /*
        ==================================================
        COMPONENTES PRINCIPAIS
        ==================================================
        */

        this.questionBank =
            new QuestionBank();

        this.examSession =
            new ExamSession();


        /*
        Componentes de interface.
        Serão criados no init().
        */

        this.questionRenderer = null;
        this.examNavigation = null;
        this.examTimer = null;
        this.examResult = null;


        /*
        ==================================================
        ELEMENTOS HTML
        ==================================================
        */

        this.elements = {};


        /*
        ==================================================
        ESTADO
        ==================================================
        */

        this.initialized = false;

        this.finishing = false;


        /*
        ==================================================
        BIND DOS EVENTOS
        ==================================================
        */

        this.handleStartExam =
            this.handleStartExam.bind(this);

        this.handlePrevious =
            this.handlePrevious.bind(this);

        this.handleNext =
            this.handleNext.bind(this);

        this.handleReview =
            this.handleReview.bind(this);

        this.handleFinishExam =
            this.handleFinishExam.bind(this);

        this.handleTimeExpired =
            this.handleTimeExpired.bind(this);

        this.handleQuestionChanged =
            this.handleQuestionChanged.bind(this);

        this.handleAnswerChanged =
            this.handleAnswerChanged.bind(this);

        this.handleReviewChanged =
            this.handleReviewChanged.bind(this);

        this.handleNewExam =
            this.handleNewExam.bind(this);

        this.handleReviewResults =
            this.handleReviewResults.bind(this);

        this.handleResultQuestionSelected =
            this.handleResultQuestionSelected.bind(this);

    }


    /*
    ======================================================
    INICIALIZAÇÃO
    ======================================================
    */

    async init() {

        if (this.initialized) {
            return true;
        }


        try {

            /*
            ----------------------------------------------
            Localizar elementos do HTML
            ----------------------------------------------
            */

            this.cacheElements();


            /*
            ----------------------------------------------
            Criar componentes
            ----------------------------------------------
            */

            this.createComponents();


            /*
            ----------------------------------------------
            Registrar eventos
            ----------------------------------------------
            */

            this.registerEvents();


            /*
            ----------------------------------------------
            Carregar banco
            ----------------------------------------------
            */

            await this.loadQuestionBank();


            /*
            ----------------------------------------------
            Atualizar tela inicial
            ----------------------------------------------
            */

            this.updateQuestionBankInformation();


            this.showStartScreen();


            this.initialized = true;


            console.log(
                "[ExamController] Simulador inicializado."
            );


            return true;

        } catch (error) {

            console.error(
                "[ExamController] Erro na inicialização:",
                error
            );


            this.showFatalError(
                "Não foi possível inicializar o simulador.",
                error.message
            );


            return false;

        }

    }


    /*
    ======================================================
    ELEMENTOS HTML
    ======================================================
    */

    cacheElements() {

        this.elements = {

            /*
            Telas
            */

            startScreen:
                document.getElementById(
                    "startScreen"
                ),

            examScreen:
                document.getElementById(
                    "examScreen"
                ),

            resultScreen:
                document.getElementById(
                    "resultScreen"
                ),


            /*
            Tela inicial
            */

            startExamButton:
                document.getElementById(
                    "startExamButton"
                ),

            questionBankSize:
                document.getElementById(
                    "questionBankSize"
                ),


            /*
            Prova
            */

            questionContainer:
                document.getElementById(
                    "questionContainer"
                ),

            navigationContainer:
                document.getElementById(
                    "navigationContainer"
                ),

            timer:
                document.getElementById(
                    "examTimer"
                ),


            /*
            Botões
            */

            previousButton:
                document.getElementById(
                    "previousButton"
                ),

            nextButton:
                document.getElementById(
                    "nextButton"
                ),

            reviewButton:
                document.getElementById(
                    "reviewButton"
                ),

            finishButton:
                document.getElementById(
                    "finishButton"
                ),


            /*
            Resultado
            */

            resultContainer:
                document.getElementById(
                    "resultContainer"
                )

        };


        /*
        Elementos obrigatórios.
        */

        const required = [

            "startScreen",
            "examScreen",

            "startExamButton",

            "questionContainer",
            "navigationContainer",

            "timer",

            "previousButton",
            "nextButton",
            "reviewButton",
            "finishButton",

            "resultScreen",
            "resultContainer"

        ];


        required.forEach(name => {

            if (!this.elements[name]) {

                throw new Error(
                    `Elemento HTML obrigatório não encontrado: ${name}`
                );

            }

        });

    }


    /*
    ======================================================
    CRIAR COMPONENTES
    ======================================================
    */

    createComponents() {

        this.questionRenderer =
            new QuestionRenderer(
                this.elements.questionContainer,
                this.examSession
            );


        this.examNavigation =
            new ExamNavigation(
                this.elements.navigationContainer,
                this.examSession,
                this.questionRenderer
            );


        this.examTimer =
            new ExamTimer(
                this.elements.timer,
                this.examSession
            );


        this.examResult =
            new ExamResult(
                this.elements.resultContainer,
                this.examSession
            );

    }


    /*
    ======================================================
    CARREGAR BANCO
    ======================================================
    */

    async loadQuestionBank() {

        await this.questionBank.load(
            this.config.questionBankPath
        );


        if (
            !this.questionBank.isLoaded()
        ) {

            throw new Error(
                "O banco de questões não foi carregado."
            );

        }

    }


    /*
    ======================================================
    INFORMAÇÃO DO BANCO
    ======================================================
    */

    updateQuestionBankInformation() {

        if (
            this.elements.questionBankSize
        ) {

            this.elements.questionBankSize
                .textContent =
                this.questionBank
                    .getTotalQuestions();

        }

    }


    /*
    ======================================================
    EVENTOS
    ======================================================
    */

    registerEvents() {

        /*
        Tela inicial
        */

        this.elements.startExamButton
            .addEventListener(
                "click",
                this.handleStartExam
            );


        /*
        Navegação
        */

        this.elements.previousButton
            .addEventListener(
                "click",
                this.handlePrevious
            );


        this.elements.nextButton
            .addEventListener(
                "click",
                this.handleNext
            );


        /*
        Revisão
        */

        this.elements.reviewButton
            .addEventListener(
                "click",
                this.handleReview
            );


        /*
        Finalizar
        */

        this.elements.finishButton
            .addEventListener(
                "click",
                this.handleFinishExam
            );


        /*
        Eventos globais
        */

        document.addEventListener(
            "exam:timeExpired",
            this.handleTimeExpired
        );


        document.addEventListener(
            "exam:questionChanged",
            this.handleQuestionChanged
        );


        document.addEventListener(
            "exam:answerChanged",
            this.handleAnswerChanged
        );


        document.addEventListener(
            "exam:reviewChanged",
            this.handleReviewChanged
        );


        document.addEventListener(
            "exam:newExam",
            this.handleNewExam
        );


        document.addEventListener(
            "exam:reviewResults",
            this.handleReviewResults
        );


        document.addEventListener(
            "exam:resultQuestionSelected",
            this.handleResultQuestionSelected
        );

    }


    /*
    ======================================================
    START EXAM
    ======================================================
    */

    handleStartExam() {

        try {

            const settings =
                this.getExamSettings();


            const questions =
                this.questionBank
                    .getRandomQuestions(
                        settings.questionCount
                    );


            this.examSession.start(
                questions,
                settings.duration
            );


            /*
            Trocar tela.
            */

            this.showExamScreen();


            /*
            Renderizar primeira questão.
            */

            this.questionRenderer
                .renderCurrentQuestion();


            /*
            Criar painel lateral.
            */

            this.examNavigation
                .render();


            /*
            Atualizar controles.
            */

            this.updateControls();


            /*
            Iniciar relógio.
            */

            this.examTimer.start();


            console.log(
                `[ExamController] Prova iniciada com ${settings.questionCount} questões.`
            );

        } catch (error) {

            console.error(
                "[ExamController] Erro ao iniciar prova:",
                error
            );


            alert(
                "Não foi possível iniciar a prova.\n\n" +
                error.message
            );

        }

    }


    /*
    ======================================================
    CONFIGURAÇÕES DA PROVA
    ======================================================
    */

    getExamSettings() {

        /*
        Procura o radio selecionado.
        */

        const selected =
            document.querySelector(
                'input[name="examMode"]:checked'
            );


        /*
        Valor padrão.
        */

        let questionCount =
            this.config.defaultQuestionCount;


        if (selected) {

            const value =
                Number(selected.value);


            if (
                Number.isInteger(value) &&
                value > 0
            ) {

                questionCount = value;

            }

        }


        /*
        Definição do tempo.

        Mantemos a relação definida
        na tela inicial:

        20 questões = 30 minutos
        45 questões = 60 minutos
        90 questões = 120 minutos
        */

        const durationMap = {

            20: 30,
            45: 60,
            90: 120

        };


        const duration =
            durationMap[questionCount] ||
            this.config.defaultDuration;


        return {

            questionCount,
            duration

        };

    }


    /*
    ======================================================
    ANTERIOR
    ======================================================
    */

    handlePrevious() {

        this.examNavigation.previous();

        this.updateControls();

    }


    /*
    ======================================================
    PRÓXIMA
    ======================================================
    */

    handleNext() {

        this.examNavigation.next();

        this.updateControls();

    }


    /*
    ======================================================
    REVISÃO
    ======================================================
    */

    handleReview() {

        this.examNavigation
            .toggleCurrentReview();


        this.updateReviewButton();

    }


    /*
    ======================================================
    FINALIZAR MANUALMENTE
    ======================================================
    */

    handleFinishExam() {

        if (
            !this.examSession.isStarted() ||
            this.examSession.isFinished()
        ) {

            return;

        }


        const progress =
            this.examSession.getProgress();


        let message =
            "Deseja finalizar a prova?";


        if (
            progress.unanswered > 0
        ) {

            message +=
                `\n\nVocê ainda possui ${progress.unanswered} questão(ões) não respondida(s).`;

        }


        if (
            progress.review > 0
        ) {

            message +=
                `\n${progress.review} questão(ões) está(ão) marcada(s) para revisão.`;

        }


        const confirmed =
            window.confirm(message);


        if (!confirmed) {
            return;
        }


        this.finishExam(
            "manual"
        );

    }


    /*
    ======================================================
    TEMPO ESGOTADO
    ======================================================
    */

    handleTimeExpired() {

        if (
            this.examSession.isFinished()
        ) {

            return;

        }


        this.finishExam(
            "timeout"
        );

    }


    /*
    ======================================================
    FINALIZAÇÃO CENTRAL
    ======================================================
    */

    finishExam(reason = "manual") {

        /*
        Impede duplo clique ou dois eventos
        tentando finalizar simultaneamente.
        */

        if (this.finishing) {
            return;
        }


        if (
            !this.examSession.isStarted() ||
            this.examSession.isFinished()
        ) {

            return;
        }


        this.finishing = true;


        try {

            /*
            Parar relógio.
            */

            this.examTimer.stop();


            /*
            Finalizar sessão.
            */

            const result =
                this.examSession.finish();


            /*
            Mostrar resultado.
            */

            this.showResultScreen();


            this.examResult.show();


            /*
            Evento geral de finalização.
            */

            const event =
                new CustomEvent(
                    "exam:finished",
                    {
                        detail: {

                            reason,

                            result

                        }
                    }
                );


            document.dispatchEvent(
                event
            );


            console.log(
                "[ExamController] Prova finalizada.",
                result
            );

        } catch (error) {

            console.error(
                "[ExamController] Erro ao finalizar prova:",
                error
            );


            alert(
                "Ocorreu um erro ao finalizar a prova."
            );

        } finally {

            this.finishing = false;

        }

    }


    /*
    ======================================================
    QUESTÃO ALTERADA
    ======================================================
    */

    handleQuestionChanged() {

        this.updateControls();

    }


    /*
    ======================================================
    RESPOSTA ALTERADA
    ======================================================
    */

    handleAnswerChanged() {

        /*
        O ExamNavigation já atualiza
        seu próprio painel.

        Aqui mantemos os demais
        controles sincronizados.
        */

        this.updateControls();

    }


    /*
    ======================================================
    REVISÃO ALTERADA
    ======================================================
    */

    handleReviewChanged() {

        this.updateReviewButton();

    }


    /*
    ======================================================
    ATUALIZAR CONTROLES
    ======================================================
    */

    updateControls() {

        if (
            !this.examSession.isStarted()
        ) {

            return;

        }


        /*
        Previous
        */

        this.elements.previousButton.disabled =
            this.examSession
                .isFirstQuestion();


        /*
        Next
        */

        this.elements.nextButton.disabled =
            this.examSession
                .isLastQuestion();


        /*
        Review
        */

        this.updateReviewButton();

    }


    /*
    ======================================================
    BOTÃO REVIEW
    ======================================================
    */

    updateReviewButton() {

        const question =
            this.examSession
                .getCurrentQuestion();


        if (!question) {
            return;
        }


        const marked =
            this.examSession
                .isMarkedForReview(
                    question.id
                );


        this.elements.reviewButton
            .classList.toggle(
                "active",
                marked
            );


        this.elements.reviewButton
            .setAttribute(
                "aria-pressed",
                String(marked)
            );


        this.elements.reviewButton
            .textContent =
            marked
                ? "REMOVER REVISÃO"
                : "MARCAR PARA REVISÃO";

    }


    /*
    ======================================================
    NOVA PROVA
    ======================================================
    */

    handleNewExam() {

        /*
        Parar timer.
        */

        this.examTimer.stop();


        /*
        Limpar resultado.
        */

        this.examResult.clear();


        /*
        Resetar sessão.
        */

        this.examSession.reset();


        /*
        Limpar questão.
        */

        this.elements.questionContainer
            .innerHTML = "";


        /*
        Limpar navegação.
        */

        this.elements.navigationContainer
            .innerHTML = "";


        /*
        Voltar à tela inicial.
        */

        this.showStartScreen();

    }


    /*
    ======================================================
    REVISAR RESULTADOS
    ======================================================
    */

    handleReviewResults() {

        const result =
            this.examSession.getResult();


        if (!result) {
            return;
        }


        /*
        Selecionamos a primeira questão.
        O modo detalhado de revisão será
        controlado posteriormente pela UI.
        */

        const firstQuestion =
            result.questions[0];


        if (!firstQuestion) {
            return;
        }


        this.examResult
            .showQuestionDetails(
                firstQuestion.id
            );

    }


    /*
    ======================================================
    QUESTÃO SELECIONADA NO RESULTADO
    ======================================================
    */

    handleResultQuestionSelected(event) {

        /*
        Neste estágio o controlador apenas
        redistribui a informação.

        O painel visual detalhado será
        implementado em componente próprio.
        */

        const detail =
            event.detail;


        const reviewEvent =
            new CustomEvent(
                "exam:openQuestionReview",
                {
                    detail
                }
            );


        document.dispatchEvent(
            reviewEvent
        );

    }


    /*
    ======================================================
    TELAS
    ======================================================
    */

    showStartScreen() {

        this.hideElement(
            this.elements.examScreen
        );

        this.hideElement(
            this.elements.resultScreen
        );

        this.showElement(
            this.elements.startScreen
        );

    }


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

    }


    showResultScreen() {

        this.hideElement(
            this.elements.startScreen
        );

        this.hideElement(
            this.elements.examScreen
        );

        this.showElement(
            this.elements.resultScreen
        );

    }


    /*
    ======================================================
    MOSTRAR ELEMENTO
    ======================================================
    */

    showElement(element) {

        if (!element) {
            return;
        }


        element.classList.remove(
            "hidden"
        );


        element.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /*
    ======================================================
    OCULTAR ELEMENTO
    ======================================================
    */

    hideElement(element) {

        if (!element) {
            return;
        }


        element.classList.add(
            "hidden"
        );


        element.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*
    ======================================================
    ERRO FATAL
    ======================================================
    */

    showFatalError(
        title,
        message
    ) {

        document.body.innerHTML = "";


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "fatal-error";


        const heading =
            document.createElement("h1");

        heading.textContent =
            title;


        const text =
            document.createElement("p");

        text.textContent =
            message;


        wrapper.appendChild(
            heading
        );

        wrapper.appendChild(
            text
        );


        document.body.appendChild(
            wrapper
        );

    }


    /*
    ======================================================
    DESTRUIR CONTROLADOR
    ======================================================
    */

    destroy() {

        /*
        Timer
        */

        if (this.examTimer) {

            this.examTimer.destroy();

        }


        /*
        Navegação
        */

        if (this.examNavigation) {

            this.examNavigation.destroy();

        }


        /*
        Botões
        */

        if (
            this.elements.startExamButton
        ) {

            this.elements.startExamButton
                .removeEventListener(
                    "click",
                    this.handleStartExam
                );

        }


        if (
            this.elements.previousButton
        ) {

            this.elements.previousButton
                .removeEventListener(
                    "click",
                    this.handlePrevious
                );

        }


        if (
            this.elements.nextButton
        ) {

            this.elements.nextButton
                .removeEventListener(
                    "click",
                    this.handleNext
                );

        }


        if (
            this.elements.reviewButton
        ) {

            this.elements.reviewButton
                .removeEventListener(
                    "click",
                    this.handleReview
                );

        }


        if (
            this.elements.finishButton
        ) {

            this.elements.finishButton
                .removeEventListener(
                    "click",
                    this.handleFinishExam
                );

        }


        /*
        Eventos globais
        */

        document.removeEventListener(
            "exam:timeExpired",
            this.handleTimeExpired
        );


        document.removeEventListener(
            "exam:questionChanged",
            this.handleQuestionChanged
        );


        document.removeEventListener(
            "exam:answerChanged",
            this.handleAnswerChanged
        );


        document.removeEventListener(
            "exam:reviewChanged",
            this.handleReviewChanged
        );


        document.removeEventListener(
            "exam:newExam",
            this.handleNewExam
        );


        document.removeEventListener(
            "exam:reviewResults",
            this.handleReviewResults
        );


        document.removeEventListener(
            "exam:resultQuestionSelected",
            this.handleResultQuestionSelected
        );


        this.initialized = false;

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamController =
    ExamController;
