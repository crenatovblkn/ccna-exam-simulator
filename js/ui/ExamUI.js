/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
Exam UI

Arquivo:
js/ui/ExamUI.js

Responsabilidade:
- Coordenar a interface do simulador
- Controlar troca entre telas
- Iniciar o exame
- Controlar navegação
- Atualizar contadores
- Controlar timer visual
- Controlar marcação para revisão
- Controlar modal de finalização
- Exibir resultado
- Coordenar os renderizadores

IMPORTANTE:
- ExamUI NÃO calcula pontuação.
- ExamUI NÃO valida respostas corretas.
- ExamUI utiliza o ExamEngine como fonte de estado.
==========================================================
*/

class ExamUI {

    constructor(options = {}) {

        /*
        ==================================================
        DEPENDÊNCIAS
        ==================================================
        */

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

        this.reviewRenderer =
            options.reviewRenderer || null;


        /*
        ==================================================
        ESTADO DA INTERFACE
        ==================================================
        */

        this.initialized =
            false;

        this.examRunning =
            false;

        this.examFinished =
            false;

        this.selectedMode =
            "standard";


        /*
        ==================================================
        CONFIGURAÇÃO DOS MODOS
        ==================================================

        quick:
        20 questões / 30 minutos

        standard:
        60 questões / 90 minutos

        full:
        banco completo / sem limite de tempo
        ==================================================
        */

        this.examModes = {

            quick: {

                questionCount: 20,

                duration:
                    30 * 60,

                label:
                    "Prática Rápida"

            },

            standard: {

                questionCount: 60,

                duration:
                    90 * 60,

                label:
                    "Simulado"

            },

            full: {

                questionCount: 180,

                /*
                0 = sem limite de tempo
                */

                duration: 0,

                label:
                    "Banco Completo"

            }

        };


        /*
        ==================================================
        ELEMENTOS DA INTERFACE
        ==================================================
        */

        this.elements = {};

    }


    /*
    ======================================================
    INICIALIZAÇÃO
    ======================================================
    */

    init() {

        if (this.initialized) {

            return this;

        }


        if (!this.engine) {

            throw new Error(
                "ExamUI: ExamEngine não foi configurado."
            );

        }


        /*
        --------------------------------------------------
        Localiza elementos do HTML
        --------------------------------------------------
        */

        this.cacheElements();


        /*
        --------------------------------------------------
        Valida elementos essenciais
        --------------------------------------------------
        */

        this.validateElements();


        /*
        --------------------------------------------------
        Eventos do DOM
        --------------------------------------------------
        */

        this.bindDOMEvents();


        /*
        --------------------------------------------------
        Eventos do ExamEngine
        --------------------------------------------------
        */

        this.bindEngineEvents();


        /*
        --------------------------------------------------
        Callbacks dos renderizadores
        --------------------------------------------------
        */

        this.configureRenderers();


        /*
        --------------------------------------------------
        Estado inicial
        --------------------------------------------------
        */

        this.prepareInitialScreen();


        this.initialized =
            true;


        return this;

    }


    /*
    ======================================================
    CACHE DOS ELEMENTOS
    ======================================================
    */

    cacheElements() {

        /*
        --------------------------------------------------
        TELAS
        --------------------------------------------------
        */

        this.elements.loadingScreen =
            document.getElementById(
                "loadingScreen"
            );


        this.elements.startScreen =
            document.getElementById(
                "startScreen"
            );


        this.elements.examScreen =
            document.getElementById(
                "examScreen"
            );


        /*
        Compatibilidade entre resultScreen/resultsScreen.
        */

        this.elements.resultScreen =
            document.getElementById(
                "resultScreen"
            ) ||
            document.getElementById(
                "resultsScreen"
            );


        this.elements.errorScreen =
            document.getElementById(
                "errorScreen"
            );


        /*
        --------------------------------------------------
        TELA INICIAL
        --------------------------------------------------
        */

        this.elements.startExamButton =
            document.getElementById(
                "startExamButton"
            );


        this.elements.questionBankSize =
            document.getElementById(
                "questionBankSize"
            );


        this.elements.startDomainName =
            document.getElementById(
                "startDomainName"
            );


        /*
        --------------------------------------------------
        CABEÇALHO DO EXAME
        --------------------------------------------------
        */

        this.elements.examDomainName =
            document.getElementById(
                "examDomainName"
            );


        this.elements.questionCounter =
            document.getElementById(
                "questionCounter"
            );


        this.elements.timer =
            document.getElementById(
                "timer"
            );


        /*
        --------------------------------------------------
        QUESTÃO
        --------------------------------------------------
        */

        this.elements.questionCard =
            document.getElementById(
                "questionCard"
            );


        this.elements.questionDomain =
            document.getElementById(
                "questionDomain"
            );


        this.elements.questionType =
            document.getElementById(
                "questionType"
            );


        this.elements.questionText =
            document.getElementById(
                "questionText"
            );


        this.elements.answerContainer =
            document.getElementById(
                "answerContainer"
            );


        /*
        --------------------------------------------------
        PROGRESSO
        --------------------------------------------------
        */

        this.elements.examProgress =
            document.getElementById(
                "examProgress"
            );


        this.elements.progressText =
            document.getElementById(
                "progressText"
            );


        /*
        --------------------------------------------------
        NAVEGAÇÃO
        --------------------------------------------------
        */

        this.elements.questionNavigation =
            document.getElementById(
                "questionNavigation"
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


        this.elements.finishExamButton =
            document.getElementById(
                "finishExamButton"
            );


        /*
        --------------------------------------------------
        BARRA DE STATUS
        --------------------------------------------------
        */

        this.elements.answeredCount =
            document.getElementById(
                "answeredCount"
            );


        this.elements.remainingCount =
            document.getElementById(
                "remainingCount"
            );


        this.elements.reviewCount =
            document.getElementById(
                "reviewCount"
            );


        this.elements.elapsedTime =
            document.getElementById(
                "elapsedTime"
            );


        /*
        --------------------------------------------------
        MODAL DE FINALIZAÇÃO
        --------------------------------------------------
        */

        this.elements.finishModal =
            document.getElementById(
                "finishModal"
            );


        this.elements.finishAnsweredCount =
            document.getElementById(
                "finishAnsweredCount"
            );


        this.elements.finishUnansweredCount =
            document.getElementById(
                "finishUnansweredCount"
            );


        this.elements.finishReviewCount =
            document.getElementById(
                "finishReviewCount"
            );


        this.elements.cancelFinishButton =
            document.getElementById(
                "cancelFinishButton"
            );


        this.elements.confirmFinishButton =
            document.getElementById(
                "confirmFinishButton"
            );


        /*
        --------------------------------------------------
        ERRO / RELOAD
        --------------------------------------------------
        */

        this.elements.reloadButton =
            document.getElementById(
                "reloadButton"
            );


        /*
        --------------------------------------------------
        MODOS DE EXAME
        --------------------------------------------------
        */

        this.elements.examModeInputs =
            Array.from(
                document.querySelectorAll(
                    'input[name="examMode"]'
                )
            );

    }


    /*
    ======================================================
    VALIDAR ELEMENTOS ESSENCIAIS
    ======================================================
    */

    validateElements() {

        const required = {

            startScreen:
                this.elements.startScreen,

            examScreen:
                this.elements.examScreen,

            startExamButton:
                this.elements.startExamButton,

            previousButton:
                this.elements.previousButton,

            nextButton:
                this.elements.nextButton,

            reviewButton:
                this.elements.reviewButton,

            finishExamButton:
                this.elements.finishExamButton,

            questionCounter:
                this.elements.questionCounter,

            timer:
                this.elements.timer,

            answeredCount:
                this.elements.answeredCount,

            remainingCount:
                this.elements.remainingCount,

            reviewCount:
                this.elements.reviewCount

        };


        const missing =
            Object.entries(required)
                .filter(
                    ([, element]) =>
                        !element
                )
                .map(
                    ([name]) =>
                        name
                );


        if (
            missing.length > 0
        ) {

            throw new Error(
                "ExamUI: elementos obrigatórios não encontrados: " +
                missing.join(", ")
            );

        }

    }


    /*
    ======================================================
    PREPARAR TELA INICIAL
    ======================================================
    */

    prepareInitialScreen() {

        this.examRunning =
            false;

        this.examFinished =
            false;


        /*
        --------------------------------------------------
        Esconde loading
        --------------------------------------------------
        */

        this.hideElement(
            this.elements.loadingScreen
        );


        /*
        --------------------------------------------------
        Mostra início
        --------------------------------------------------
        */

        this.showScreen(
            this.elements.startScreen
        );


        /*
        --------------------------------------------------
        Esconde exame e resultado
        --------------------------------------------------
        */

        this.hideScreen(
            this.elements.examScreen
        );


        this.hideScreen(
            this.elements.resultScreen
        );


        /*
        --------------------------------------------------
        Quantidade de questões
        --------------------------------------------------
        */

        if (
            this.elements.questionBankSize
        ) {

            this.elements
                .questionBankSize
                .textContent =
                    String(
                        this.getAvailableQuestionCount()
                    );

        }


        /*
        --------------------------------------------------
        Domínio
        --------------------------------------------------
        */

        if (
            this.elements.startDomainName
        ) {

            this.elements
                .startDomainName
                .textContent =
                    "Network Fundamentals";

        }


        /*
        --------------------------------------------------
        Modo selecionado
        --------------------------------------------------
        */

        const checked =
            this.elements
                .examModeInputs
                .find(
                    input =>
                        input.checked
                );


        if (
            checked &&
            this.examModes[
                checked.value
            ]
        ) {

            this.selectedMode =
                checked.value;

        }


        /*
        --------------------------------------------------
        Contadores
        --------------------------------------------------
        */

        this.resetStatusDisplay();

    }


    /*
    ======================================================
    EVENTOS DO DOM
    ======================================================
    */

    bindDOMEvents() {

        /*
        --------------------------------------------------
        SELEÇÃO DO MODO
        --------------------------------------------------
        */

        this.elements
            .examModeInputs
            .forEach(
                input => {

                    input.addEventListener(
                        "change",
                        () => {

                            if (
                                input.checked &&
                                this.examModes[
                                    input.value
                                ]
                            ) {

                                this.selectedMode =
                                    input.value;

                            }

                        }
                    );

                }
            );


        /*
        --------------------------------------------------
        INICIAR EXAME
        --------------------------------------------------
        */

        this.elements
            .startExamButton
            .addEventListener(
                "click",
                () => {

                    this.startExamFromUI();

                }
            );


        /*
        --------------------------------------------------
        QUESTÃO ANTERIOR
        --------------------------------------------------
        */

        this.elements
            .previousButton
            .addEventListener(
                "click",
                () => {

                    if (
                        !this.examRunning
                    ) {

                        return;

                    }


                    if (
                        typeof this.engine
                            .previousQuestion ===
                            "function"
                    ) {

                        this.engine
                            .previousQuestion();

                    }
                    else if (
                        typeof this.engine
                            .previous ===
                            "function"
                    ) {

                        this.engine
                            .previous();

                    }

                }
            );


        /*
        --------------------------------------------------
        PRÓXIMA QUESTÃO
        --------------------------------------------------
        */

        this.elements
            .nextButton
            .addEventListener(
                "click",
                () => {

                    if (
                        !this.examRunning
                    ) {

                        return;

                    }


                    if (
                        typeof this.engine
                            .nextQuestion ===
                            "function"
                    ) {

                        this.engine
                            .nextQuestion();

                    }
                    else if (
                        typeof this.engine
                            .next ===
                            "function"
                    ) {

                        this.engine
                            .next();

                    }

                }
            );


        /*
        --------------------------------------------------
        MARCAR PARA REVISÃO
        --------------------------------------------------
        */

        this.elements
            .reviewButton
            .addEventListener(
                "click",
                () => {

                    if (
                        !this.examRunning
                    ) {

                        return;

                    }


                    if (
                        typeof this.engine
                            .toggleReview ===
                            "function"
                    ) {

                        this.engine
                            .toggleReview();

                    }

                }
            );


        /*
        --------------------------------------------------
        FINALIZAR EXAME
        --------------------------------------------------
        */

        this.elements
            .finishExamButton
            .addEventListener(
                "click",
                () => {

                    if (
                        !this.examRunning
                    ) {

                        return;

                    }


                    this.openFinishModal();

                }
            );


        /*
        --------------------------------------------------
        CANCELAR FINALIZAÇÃO
        --------------------------------------------------
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
        --------------------------------------------------
        CONFIRMAR FINALIZAÇÃO
        --------------------------------------------------
        */

        if (
            this.elements.confirmFinishButton
        ) {

            this.elements
                .confirmFinishButton
                .addEventListener(
                    "click",
                    () => {

                        this.confirmFinishExam();

                    }
                );

        }


        /*
        --------------------------------------------------
        BACKDROP DO MODAL
        --------------------------------------------------
        */

        if (
            this.elements.finishModal
        ) {

            const backdrop =
                this.elements
                    .finishModal
                    .querySelector(
                        "[data-modal-close]"
                    );


            if (backdrop) {

                backdrop.addEventListener(
                    "click",
                    () => {

                        this.closeFinishModal();

                    }
                );

            }

        }


        /*
        --------------------------------------------------
        TECLA ESC
        --------------------------------------------------
        */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape" &&
                    this.isFinishModalOpen()
                ) {

                    this.closeFinishModal();

                }

            }
        );


        /*
        --------------------------------------------------
        RECARREGAR
        --------------------------------------------------
        */

        if (
            this.elements.reloadButton
        ) {

            this.elements
                .reloadButton
                .addEventListener(
                    "click",
                    () => {

                        window.location.reload();

                    }
                );

        }

    }


    /*
    ======================================================
    MODAL DE FINALIZAÇÃO
    ======================================================
    */

    openFinishModal() {

        if (
            !this.elements.finishModal
        ) {

            /*
            Se o HTML não possuir modal, finalizamos
            diretamente como fallback.
            */

            this.confirmFinishExam();

            return;

        }


        /*
        --------------------------------------------------
        Obtém progresso atual
        --------------------------------------------------
        */

        let progress = null;


        if (
            this.engine &&
            typeof this.engine
                .getProgress ===
                "function"
        ) {

            progress =
                this.engine
                    .getProgress();

        }


        /*
        --------------------------------------------------
        Atualiza informações do modal
        --------------------------------------------------
        */

        if (
            progress &&
            this.elements.finishAnsweredCount
        ) {

            this.elements
                .finishAnsweredCount
                .textContent =
                    String(
                        progress.answered || 0
                    );

        }


        if (
            progress &&
            this.elements.finishUnansweredCount
        ) {

            const unanswered =
                Number.isFinite(
                    Number(
                        progress.remaining
                    )
                )
                    ? Number(
                        progress.remaining
                    )
                    : Math.max(
                        0,
                        Number(
                            progress.total || 0
                        ) -
                        Number(
                            progress.answered || 0
                        )
                    );


            this.elements
                .finishUnansweredCount
                .textContent =
                    String(
                        unanswered
                    );

        }


        if (
            progress &&
            this.elements.finishReviewCount
        ) {

            this.elements
                .finishReviewCount
                .textContent =
                    String(
                        progress.review || 0
                    );

        }


        /*
        --------------------------------------------------
        Exibe modal
        --------------------------------------------------
        */

        this.elements
            .finishModal
            .classList
            .remove(
                "hidden"
            );


        this.elements
            .finishModal
            .classList
            .add(
                "active"
            );


        this.elements
            .finishModal
            .removeAttribute(
                "hidden"
            );


        this.elements
            .finishModal
            .setAttribute(
                "aria-hidden",
                "false"
            );

    }


    /*
    ======================================================
    FECHAR MODAL DE FINALIZAÇÃO
    ======================================================
    */

    closeFinishModal() {

        if (
            !this.elements.finishModal
        ) {

            return;

        }


        this.elements
            .finishModal
            .classList
            .remove(
                "active"
            );


        this.elements
            .finishModal
            .classList
            .add(
                "hidden"
            );


        this.elements
            .finishModal
            .setAttribute(
                "hidden",
                ""
            );


        this.elements
            .finishModal
            .setAttribute(
                "aria-hidden",
                "true"
            );

    }


    /*
    ======================================================
    VERIFICAR MODAL
    ======================================================
    */

    isFinishModalOpen() {

        if (
            !this.elements.finishModal
        ) {

            return false;

        }


        return (
            !this.elements
                .finishModal
                .hasAttribute(
                    "hidden"
                ) &&
            !this.elements
                .finishModal
                .classList
                .contains(
                    "hidden"
                )
        );

    }


    /*
    ======================================================
    CONFIRMAR FINALIZAÇÃO
    ======================================================
    */

    confirmFinishExam() {

        if (
            !this.examRunning
        ) {

            return;

        }


        this.closeFinishModal();


        if (
            !this.engine
        ) {

            return;

        }


        if (
            typeof this.engine
                .finishExam ===
                "function"
        ) {

            this.engine
                .finishExam();

            return;

        }


        if (
            typeof this.engine
                .finish ===
                "function"
        ) {

            this.engine
                .finish();

            return;

        }


        this.showError(
            "ExamEngine não possui método de finalização."
        );

    }


    /*
    ======================================================
    EVENTOS DO EXAM ENGINE
    ======================================================
    */

    bindEngineEvents() {


            /*
        --------------------------------------------------
        EXAME INICIADO
        --------------------------------------------------
        */

        this.engine.on(
            "examStarted",
            data => {

                this.examRunning =
                    true;

                this.examFinished =
                    false;


                this.closeFinishModal();


                /*
                ------------------------------------------
                Troca de tela
                ------------------------------------------
                */

                this.hideScreen(
                    this.elements.startScreen
                );


                this.showScreen(
                    this.elements.examScreen
                );


                this.hideScreen(
                    this.elements.resultScreen
                );


                /*
                ------------------------------------------
                Domínio
                ------------------------------------------
                */

                if (
                    this.elements.examDomainName
                ) {

                    this.elements
                        .examDomainName
                        .textContent =
                            "Network Fundamentals";

                }


                /*
                ------------------------------------------
                Renderização inicial
                ------------------------------------------
                */

                this.renderCurrentQuestion();

                this.updateInterface();

                this.updateNavigationRenderer();


                /*
                ------------------------------------------
                Timer inicial
                ------------------------------------------
                */

                if (
                    data &&
                    data.remainingTime !==
                        undefined
                ) {

                    this.updateTimer(
                        data.remainingTime
                    );

                }


                if (
                    data &&
                    data.elapsedTime !==
                        undefined
                ) {

                    this.updateElapsedTime(
                        data.elapsedTime
                    );

                }

            }
        );


        /*
        --------------------------------------------------
        QUESTÃO ALTERADA
        --------------------------------------------------
        */

        this.engine.on(
            "questionChanged",
            () => {

                if (
                    !this.examRunning
                ) {

                    return;

                }


                this.renderCurrentQuestion();

                this.updateInterface();

                this.updateNavigationRenderer();

                this.autoSave();

            }
        );


        /*
        --------------------------------------------------
        RESPOSTA ALTERADA
        --------------------------------------------------
        */

        this.engine.on(
            "answerChanged",
            () => {

                if (
                    !this.examRunning
                ) {

                    return;

                }


                this.updateInterface();

                this.updateNavigationRenderer();

                this.autoSave();

            }
        );


        /*
        --------------------------------------------------
        REVISÃO ALTERADA
        --------------------------------------------------
        */

        this.engine.on(
            "reviewChanged",
            () => {

                if (
                    !this.examRunning
                ) {

                    return;

                }


                this.updateInterface();

                this.updateNavigationRenderer();

                this.autoSave();

            }
        );


        /*
        --------------------------------------------------
        TIMER
        --------------------------------------------------
        */

        this.engine.on(
            "timerTick",
            data => {

                if (!data) {

                    return;

                }


                if (
                    data.remainingTime !==
                        undefined
                ) {

                    this.updateTimer(
                        data.remainingTime
                    );

                }


                if (
                    data.elapsedTime !==
                        undefined
                ) {

                    this.updateElapsedTime(
                        data.elapsedTime
                    );

                }

            }
        );


        /*
        --------------------------------------------------
        EXAME FINALIZADO
        --------------------------------------------------
        */

        this.engine.on(
            "examFinished",
            result => {

                this.handleExamFinished(
                    result
                );

            }
        );


        /*
        --------------------------------------------------
        EXAME RESETADO
        --------------------------------------------------
        */

        this.engine.on(
            "examReset",
            () => {

                this.prepareInitialScreen();

            }
        );


        /*
        --------------------------------------------------
        ERRO
        --------------------------------------------------
        */

        this.engine.on(
            "error",
            error => {

                const message =
                    error &&
                    error.message
                        ? error.message
                        : String(
                            error ||
                            "Erro desconhecido."
                        );


                this.showError(
                    message
                );

            }
        );

    }


    /*
    ======================================================
    CONFIGURAR RENDERIZADORES
    ======================================================
    */

    configureRenderers() {

        /*
        --------------------------------------------------
        QUESTION RENDERER
        --------------------------------------------------
        */

        if (
            this.questionRenderer
        ) {

            if (
                typeof this.questionRenderer
                    .setOnAnswer ===
                    "function"
            ) {

                this.questionRenderer
                    .setOnAnswer(
                        answer => {

                            this.handleAnswer(
                                answer
                            );

                        }
                    );

            }


            if (
                "onAnswer" in
                this.questionRenderer
            ) {

                this.questionRenderer
                    .onAnswer =
                        answer => {

                            this.handleAnswer(
                                answer
                            );

                        };

            }

        }


        /*
        --------------------------------------------------
        NAVIGATION RENDERER
        --------------------------------------------------
        */

        if (
            this.navigationRenderer
        ) {

            if (
                typeof this.navigationRenderer
                    .setOnNavigate ===
                    "function"
            ) {

                this.navigationRenderer
                    .setOnNavigate(
                        index => {

                            this.goToQuestion(
                                index
                            );

                        }
                    );

            }


            if (
                "onNavigate" in
                this.navigationRenderer
            ) {

                this.navigationRenderer
                    .onNavigate =
                        index => {

                            this.goToQuestion(
                                index
                            );

                        };

            }

        }


        /*
        --------------------------------------------------
        RESULT RENDERER
        --------------------------------------------------
        */

        if (
            this.resultRenderer
        ) {

            if (
                typeof this.resultRenderer
                    .setOnRestart ===
                    "function"
            ) {

                this.resultRenderer
                    .setOnRestart(
                        () => {

                            this.restartApplication();

                        }
                    );

            }


            if (
                "onRestart" in
                this.resultRenderer
            ) {

                this.resultRenderer
                    .onRestart =
                        () => {

                            this.restartApplication();

                        };

            }

        }

    }


    /*
    ======================================================
    INICIAR EXAME PELA INTERFACE
    ======================================================
    */

    startExamFromUI() {

        if (
            this.examRunning
        ) {

            return;

        }


        this.closeFinishModal();


        /*
        --------------------------------------------------
        Determina modo selecionado
        --------------------------------------------------
        */

        const checked =
            this.elements
                .examModeInputs
                .find(
                    input =>
                        input.checked
                );


        if (
            checked &&
            this.examModes[
                checked.value
            ]
        ) {

            this.selectedMode =
                checked.value;

        }


        const mode =
            this.examModes[
                this.selectedMode
            ] ||
            this.examModes.standard;


        /*
        --------------------------------------------------
        Quantidade disponível
        --------------------------------------------------
        */

        const available =
            this.getAvailableQuestionCount();


        if (
            available <= 0
        ) {

            this.showError(
                "O banco de questões está vazio."
            );

            return;

        }


        /*
        --------------------------------------------------
        Quantidade solicitada
        --------------------------------------------------
        */

        let questionCount =
            mode.questionCount;


        if (
            this.selectedMode ===
            "full"
        ) {

            questionCount =
                available;

        }


        questionCount =
            Math.min(
                questionCount,
                available
            );


        /*
        --------------------------------------------------
        CORREÇÃO DA INTEGRAÇÃO COM O EXAM ENGINE

        ExamUI:
        quick / standard / full

        ExamEngine:
        practice / standard / full

        ExamEngine espera:
        questions
        duration
        shuffle

        e NÃO:
        questionCount
        shuffleQuestions
        shuffleAnswers
        --------------------------------------------------
        */

        const config = {

    mode:
        this.selectedMode,

    questionCount:
        questionCount,

    duration:
        mode.duration,

    shuffleQuestions:
        true,

    shuffleAnswers:
        true

};

        console.log(
            "ExamUI: iniciando exame.",
            config
        );


        /*
        --------------------------------------------------
        Desabilita botão temporariamente
        --------------------------------------------------
        */

        if (
            this.elements.startExamButton
        ) {

            this.elements
                .startExamButton
                .disabled =
                    true;

        }


        try {

            /*
            ----------------------------------------------
            API PRINCIPAL DO EXAM ENGINE

            begin(config):
            1. cria o exame
            2. aplica quantidade
            3. aplica duração
            4. inicia o exame
            5. inicia o timer
            ----------------------------------------------
            */

            if (
    typeof this.engine
        .startExam ===
        "function"
) {

    const result =
        this.engine
            .startExam(
                config
            );


    if (
        result &&
        typeof result.then ===
            "function"
    ) {

        result.catch(
            error => {

                this.handleStartError(
                    error
                );

            }
        );

    }


    return;

}


throw new Error(
    "ExamEngine não possui startExam()."
);

        }
        catch (error) {

            this.handleStartError(
                error
            );

        }

    }


    /*
    ======================================================
    ERRO AO INICIAR EXAME
    ======================================================
    */

    handleStartError(
        error
    ) {

        this.examRunning =
            false;


        if (
            this.elements.startExamButton
        ) {

            this.elements
                .startExamButton
                .disabled =
                    false;

        }


        const message =
            error &&
            error.message
                ? error.message
                : String(
                    error ||
                    "Não foi possível iniciar o exame."
                );


        console.error(
            "ExamUI: erro ao iniciar exame.",
            error
        );


        this.showError(
            message
        );

    }


    /*
    ======================================================
    PROCESSAR RESPOSTA
    ======================================================
    */

    handleAnswer(
        answer
    ) {

        if (
            !this.examRunning ||
            !this.engine
        ) {

            return;

        }


        /*
        --------------------------------------------------
        API principal
        --------------------------------------------------
        */

        if (
            typeof this.engine
                .answerCurrentQuestion ===
                "function"
        ) {

            this.engine
                .answerCurrentQuestion(
                    answer
                );

            return;

        }


        /*
        --------------------------------------------------
        API do ExamEngine atual
        --------------------------------------------------
        */

        if (
            typeof this.engine
                .answer ===
                "function"
        ) {

            this.engine
                .answer(
                    answer
                );

            return;

        }


        /*
        --------------------------------------------------
        Compatibilidade
        --------------------------------------------------
        */

        if (
            typeof this.engine
                .setAnswer ===
                "function"
        ) {

            this.engine
                .setAnswer(
                    answer
                );

            return;

        }


        if (
            typeof this.engine
                .answerQuestion ===
                "function"
        ) {

            const question =
                this.getCurrentQuestion();


            if (!question) {

                return;

            }


            this.engine
                .answerQuestion(
                    question.id,
                    answer
                );

        }

    }


    /*
    ======================================================
    IR PARA QUESTÃO
    ======================================================
    */

    goToQuestion(
        index
    ) {

        if (
            !this.examRunning ||
            !this.engine
        ) {

            return;

        }


        const target =
            Number(
                index
            );


        if (
            !Number.isInteger(
                target
            )
        ) {

            return;

        }


        if (
            typeof this.engine
                .goToQuestion ===
                "function"
        ) {

            this.engine
                .goToQuestion(
                    target
                );

            return;

        }


        /*
        --------------------------------------------------
        API do ExamEngine atual
        --------------------------------------------------
        */

        if (
            typeof this.engine
                .goTo ===
                "function"
        ) {

            this.engine
                .goTo(
                    target
                );

            return;

        }


        if (
            typeof this.engine
                .setCurrentQuestion ===
                "function"
        ) {

            this.engine
                .setCurrentQuestion(
                    target
                );

        }

    }


    /*
    ======================================================
    OBTER QUESTÃO ATUAL
    ======================================================
    */

    getCurrentQuestion() {

        if (
            !this.engine
        ) {

            return null;

        }


        if (
            typeof this.engine
                .getCurrentQuestion ===
                "function"
        ) {

            return this.engine
                .getCurrentQuestion();

        }


        if (
            this.engine.currentQuestion
        ) {

            return this.engine
                .currentQuestion;

        }


        return null;

    }


    /*
    ======================================================
    OBTER ÍNDICE ATUAL
    ======================================================
    */

    getCurrentQuestionIndex() {

        if (
            !this.engine
        ) {

            return 0;

        }


        if (
            typeof this.engine
                .getCurrentQuestionIndex ===
                "function"
        ) {

            const index =
                Number(
                    this.engine
                        .getCurrentQuestionIndex()
                );


            return Number.isFinite(
                index
            )
                ? index
                : 0;

        }


        /*
        --------------------------------------------------
        API do ExamEngine atual
        --------------------------------------------------
        */

        if (
            typeof this.engine
                .getCurrentIndex ===
                "function"
        ) {

            const index =
                Number(
                    this.engine
                        .getCurrentIndex()
                );


            return Number.isFinite(
                index
            )
                ? index
                : 0;

        }


        if (
            Number.isFinite(
                Number(
                    this.engine
                        .currentQuestionIndex
                )
            )
        ) {

            return Number(
                this.engine
                    .currentQuestionIndex
            );

        }


        return 0;

    }


    /*
    ======================================================
    RENDERIZAR QUESTÃO ATUAL
    ======================================================
    */

    renderCurrentQuestion() {

        const question =
            this.getCurrentQuestion();


        if (!question) {

            return;

        }


        /*
        --------------------------------------------------
        Usa QuestionRenderer quando disponível
        --------------------------------------------------
        */

        if (
            this.questionRenderer &&
            typeof this.questionRenderer
                .render ===
                "function"
        ) {

            const currentAnswer =
                this.getCurrentAnswer();


            this.questionRenderer
                .render(
                    question,
                    currentAnswer
                );


            return;

        }


        /*
        --------------------------------------------------
        Fallback simples
        --------------------------------------------------
        */

        if (
            this.elements.questionDomain
        ) {

            this.elements
                .questionDomain
                .textContent =
                    question.domain ||
                    "Network Fundamentals";

        }


        if (
            this.elements.questionType
        ) {

            this.elements
                .questionType
                .textContent =
                    question.type ||
                    "";

        }


        if (
            this.elements.questionText
        ) {

            this.elements
                .questionText
                .textContent =
                    question.text ||
                    question.question ||
                    "";

        }

    }


    /*
    ======================================================
    OBTER RESPOSTA ATUAL
    ======================================================
    */

    getCurrentAnswer() {

        if (
            !this.engine
        ) {

            return null;

        }


        if (
            typeof this.engine
                .getCurrentAnswer ===
                "function"
        ) {

            return this.engine
                .getCurrentAnswer();

        }


        const question =
            this.getCurrentQuestion();


        if (!question) {

            return null;

        }


        if (
            typeof this.engine
                .getAnswer ===
                "function"
        ) {

            return this.engine
                .getAnswer(
                    question.id
                );

        }


        return null;

    }


    /*
    ======================================================
    ATUALIZAR INTERFACE
    ======================================================
    */

    updateInterface() {

        if (
            !this.engine
        ) {

            return;

        }


        this.updateProgress();

        this.updateNavigationButtons();

        this.updateReviewButton();

    }


    /*
    ======================================================
    ATUALIZAR PROGRESSO
    ======================================================
    */

    updateProgress() {

        let progress = null;


        if (
            typeof this.engine
                .getProgress ===
                "function"
        ) {

            progress =
                this.engine
                    .getProgress();

        }


        /*
        --------------------------------------------------
        Fallback
        --------------------------------------------------
        */

        if (!progress) {

            const total =
                this.getExamQuestionCount();


            const currentIndex =
                this.getCurrentQuestionIndex();


            progress = {

                total:
                    total,

                current:
                    currentIndex + 1,

                answered:
                    0,

                remaining:
                    total,

                review:
                    0

            };

        }


        const total =
            Number(
                progress.total || 0
            );


        const current =
            Number(
                progress.current ||
                (
                    this.getCurrentQuestionIndex() +
                    1
                )
            );


        const answered =
            Number(
                progress.answered || 0
            );


        const remaining =
            Number.isFinite(
                Number(
                    progress.remaining
                )
            )
                ? Number(
                    progress.remaining
                )
                : Math.max(
                    0,
                    total -
                    answered
                );


        const review =
            Number(
                progress.review || 0
            );


        /*
        --------------------------------------------------
        Contador da questão
        --------------------------------------------------
        */

        if (
            this.elements.questionCounter
        ) {

            this.elements
                .questionCounter
                .textContent =
                    `${current} / ${total}`;

        }


        /*
        --------------------------------------------------
        Respondidas
        --------------------------------------------------
        */

        if (
            this.elements.answeredCount
        ) {

            this.elements
                .answeredCount
                .textContent =
                    String(
                        answered
                    );

        }


        /*
        --------------------------------------------------
        Restantes
        --------------------------------------------------
        */

        if (
            this.elements.remainingCount
        ) {

            this.elements
                .remainingCount
                .textContent =
                    String(
                        remaining
                    );

        }


        /*
        --------------------------------------------------
        Revisão
        --------------------------------------------------
        */

        if (
            this.elements.reviewCount
        ) {

            this.elements
                .reviewCount
                .textContent =
                    String(
                        review
                    );

        }


        /*
        --------------------------------------------------
        Barra de progresso
        --------------------------------------------------
        */

        const percentage =
            total > 0
                ? Math.round(
                    (
                        current /
                        total
                    ) *
                    100
                )
                : 0;


        if (
            this.elements.examProgress
        ) {

            if (
                "value" in
                this.elements.examProgress
            ) {

                this.elements
                    .examProgress
                    .value =
                        percentage;

            }


            this.elements
                .examProgress
                .style.width =
                    `${percentage}%`;


            this.elements
                .examProgress
                .setAttribute(
                    "aria-valuenow",
                    String(
                        percentage
                    )
                );

        }


        if (
            this.elements.progressText
        ) {

            this.elements
                .progressText
                .textContent =
                    `${percentage}%`;

        }

    }


    /*
    ======================================================
    QUANTIDADE DE QUESTÕES DO EXAME
    ======================================================
    */

    getExamQuestionCount() {

        if (
            !this.engine
        ) {

            return 0;

        }


        if (
            typeof this.engine
                .getQuestionCount ===
                "function"
        ) {

            return Number(
                this.engine
                    .getQuestionCount()
            ) || 0;

        }


        /*
        --------------------------------------------------
        API do ExamEngine atual
        --------------------------------------------------
        */

        if (
            typeof this.engine
                .getTotalQuestions ===
                "function"
        ) {

            return Number(
                this.engine
                    .getTotalQuestions()
            ) || 0;

        }


        if (
            typeof this.engine
                .getQuestions ===
                "function"
        ) {

            const questions =
                this.engine
                    .getQuestions();


            return Array.isArray(
                questions
            )
                ? questions.length
                : 0;

        }


        if (
            Array.isArray(
                this.engine.questions
            )
        ) {

            return this.engine
                .questions
                .length;

        }


        return 0;

    }


    /*
    ======================================================
    ATUALIZAR BOTÕES DE NAVEGAÇÃO
    ======================================================
    */

    updateNavigationButtons() {

        const index =
            this.getCurrentQuestionIndex();


        const total =
            this.getExamQuestionCount();


        /*
        --------------------------------------------------
        Anterior
        --------------------------------------------------
        */

        if (
            this.elements.previousButton
        ) {

            this.elements
                .previousButton
                .disabled =
                    (
                        !this.examRunning ||
                        index <= 0
                    );

        }


        /*
        --------------------------------------------------
        Próxima
        --------------------------------------------------
        */

        if (
            this.elements.nextButton
        ) {

            this.elements
                .nextButton
                .disabled =
                    (
                        !this.examRunning ||
                        total <= 0 ||
                        index >=
                            total - 1
                    );

        }


        /*
        --------------------------------------------------
        Finalizar
        --------------------------------------------------
        */

        if (
            this.elements.finishExamButton
        ) {

            this.elements
                .finishExamButton
                .disabled =
                    !this.examRunning;

        }

    }


    /*
    ======================================================
    ATUALIZAR BOTÃO DE REVISÃO
    ======================================================
    */

    updateReviewButton() {

        if (
            !this.elements.reviewButton
        ) {

            return;

        }


        let marked =
            false;


        if (
            this.engine &&
            typeof this.engine
                .isCurrentQuestionMarkedForReview ===
                "function"
        ) {

            marked =
                Boolean(
                    this.engine
                        .isCurrentQuestionMarkedForReview()
                );

        }
        else if (
            this.engine &&
            typeof this.engine
                .isMarkedForReview ===
                "function"
        ) {

            const question =
                this.getCurrentQuestion();


            if (question) {

                marked =
                    Boolean(
                        this.engine
                            .isMarkedForReview(
                                question.id
                            )
                    );

            }

        }


        this.elements
            .reviewButton
            .classList
            .toggle(
                "active",
                marked
            );


        this.elements
            .reviewButton
            .setAttribute(
                "aria-pressed",
                marked
                    ? "true"
                    : "false"
            );


        const label =
            this.elements
                .reviewButton
                .querySelector(
                    "[data-review-label]"
                );


        if (label) {

            label.textContent =
                marked
                    ? "Marcada para revisão"
                    : "Marcar para revisão";

        }

    }


    /*
    ======================================================
    ATUALIZAR TIMER
    ======================================================
    */

    updateTimer(
        seconds
    ) {

        if (
            !this.elements.timer
        ) {

            return;

        }


        const value =
            Math.max(
                0,
                Number(
                    seconds
                ) || 0
            );


        this.elements
            .timer
            .textContent =
                this.formatTime(
                    value
                );


        /*
        --------------------------------------------------
        Classes de alerta
        --------------------------------------------------
        */

        this.elements
            .timer
            .classList
            .remove(
                "warning",
                "danger"
            );


        if (
            value > 0 &&
            value <= 300
        ) {

            this.elements
                .timer
                .classList
                .add(
                    "danger"
                );

        }
        else if (
            value > 300 &&
            value <= 900
        ) {

            this.elements
                .timer
                .classList
                .add(
                    "warning"
                );

        }

    }


    /*
    ======================================================
    ATUALIZAR TEMPO DECORRIDO
    ======================================================
    */

    updateElapsedTime(
        seconds
    ) {

        if (
            !this.elements.elapsedTime
        ) {

            return;

        }


        this.elements
            .elapsedTime
            .textContent =
                this.formatTime(
                    seconds
                );

    }


    /*
    ======================================================
    FORMATAR TEMPO
    ======================================================
    */

    formatTime(
        seconds
    ) {

        const value =
            Math.max(
                0,
                Math.floor(
                    Number(
                        seconds
                    ) || 0
                )
            );


        const hours =
            Math.floor(
                value / 3600
            );


        const minutes =
            Math.floor(
                (
                    value % 3600
                ) /
                60
            );


        const remainingSeconds =
            value % 60;


        return [
            hours,
            minutes,
            remainingSeconds
        ]
            .map(
                item =>
                    String(
                        item
                    )
                        .padStart(
                            2,
                            "0"
                        )
            )
            .join(
                ":"
            );

    }


    /*
    ======================================================
    ATUALIZAR NAVEGAÇÃO LATERAL
    ======================================================
    */

    updateNavigationRenderer() {

            if (
            !this.navigationRenderer
        ) {

            return;

        }


        /*
        --------------------------------------------------
        Renderização completa
        --------------------------------------------------
        */

        if (
            typeof this.navigationRenderer
                .render ===
                "function"
        ) {

            const state =
                this.getNavigationState();


            this.navigationRenderer
                .render(
                    state
                );


            return;

        }


        /*
        --------------------------------------------------
        Atualização de estados
        --------------------------------------------------
        */

        if (
            typeof this.navigationRenderer
                .updateStates ===
                "function"
        ) {

            this.navigationRenderer
                .updateStates(
                    this.getNavigationState()
                );

        }

    }


    /*
    ======================================================
    ESTADO PARA NAVEGAÇÃO
    ======================================================
    */

    getNavigationState() {

        const total =
            this.getExamQuestionCount();


        const currentIndex =
            this.getCurrentQuestionIndex();


        let progress = null;


        if (
            this.engine &&
            typeof this.engine
                .getProgress ===
                "function"
        ) {

            progress =
                this.engine
                    .getProgress();

        }


        return {

            total:
                total,

            currentIndex:
                currentIndex,

            progress:
                progress,

            engine:
                this.engine

        };

    }


    /*
    ======================================================
    AUTO SAVE
    ======================================================
    */

    autoSave() {

        if (
            !this.storageManager ||
            !this.engine ||
            !this.examRunning
        ) {

            return;

        }


        try {

            let state = null;


            /*
            ------------------------------------------------
            ExamEngine atual
            ------------------------------------------------
            */

            if (
                typeof this.engine
                    .getState ===
                    "function"
            ) {

                state =
                    this.engine
                        .getState();

            }
            else if (
                typeof this.engine
                    .exportState ===
                    "function"
            ) {

                state =
                    this.engine
                        .exportState();

            }


            if (!state) {

                return;

            }


            /*
            ------------------------------------------------
            StorageManager
            ------------------------------------------------
            */

            if (
                typeof this.storageManager
                    .saveExamState ===
                    "function"
            ) {

                this.storageManager
                    .saveExamState(
                        state
                    );

                return;

            }


            if (
                typeof this.storageManager
                    .save ===
                    "function"
            ) {

                this.storageManager
                    .save(
                        state
                    );

            }

        }
        catch (error) {

            /*
            Falha no autosave não deve interromper
            o exame.
            */

            console.warn(
                "ExamUI: não foi possível salvar o estado do exame.",
                error
            );

        }

    }


    /*
    ======================================================
    EXAME FINALIZADO
    ======================================================
    */

    handleExamFinished(
        result
    ) {

        this.examRunning =
            false;

        this.examFinished =
            true;


        this.closeFinishModal();


        /*
        --------------------------------------------------
        Limpa sessão persistida
        --------------------------------------------------
        */

        if (
            this.storageManager
        ) {

            try {

                if (
                    typeof this.storageManager
                        .clearExamState ===
                        "function"
                ) {

                    this.storageManager
                        .clearExamState();

                }
                else if (
                    typeof this.storageManager
                        .clear ===
                        "function"
                ) {

                    this.storageManager
                        .clear();

                }

            }
            catch (error) {

                console.warn(
                    "ExamUI: não foi possível limpar o estado salvo.",
                    error
                );

            }

        }


        /*
        --------------------------------------------------
        Troca para tela de resultado
        --------------------------------------------------
        */

        this.hideScreen(
            this.elements.examScreen
        );


        if (
            this.elements.resultScreen
        ) {

            this.showScreen(
                this.elements.resultScreen
            );

        }


        /*
        --------------------------------------------------
        Renderiza resultado
        --------------------------------------------------
        */

        if (
            this.resultRenderer &&
            typeof this.resultRenderer
                .render ===
                "function"
        ) {

            this.resultRenderer
                .render(
                    result
                );

        }

    }


    /*
    ======================================================
    REINICIAR APLICAÇÃO
    ======================================================
    */

    restartApplication() {

        this.closeFinishModal();


        /*
        --------------------------------------------------
        Limpa resultado visual
        --------------------------------------------------
        */

        if (
            this.resultRenderer &&
            typeof this.resultRenderer
                .clear ===
                "function"
        ) {

            this.resultRenderer
                .clear();

        }


        /*
        --------------------------------------------------
        Limpa navegação visual
        --------------------------------------------------
        */

        if (
            this.navigationRenderer &&
            typeof this.navigationRenderer
                .clear ===
                "function"
        ) {

            this.navigationRenderer
                .clear();

        }


        /*
        --------------------------------------------------
        Reseta ExamEngine
        --------------------------------------------------
        */

        if (
            this.engine &&
            typeof this.engine
                .reset ===
                "function"
        ) {

            this.engine
                .reset();


            /*
            O ExamEngine poderá emitir examReset.
            Nesse caso prepareInitialScreen() será
            executado pelo listener.
            */

            return;

        }


        /*
        --------------------------------------------------
        Fallback
        --------------------------------------------------
        */

        this.examRunning =
            false;

        this.examFinished =
            false;


        this.prepareInitialScreen();

    }


    /*
    ======================================================
    RESET DOS CONTADORES VISUAIS
    ======================================================
    */

    resetStatusDisplay() {

        if (
            this.elements.questionCounter
        ) {

            this.elements
                .questionCounter
                .textContent =
                    "0 / 0";

        }


        if (
            this.elements.answeredCount
        ) {

            this.elements
                .answeredCount
                .textContent =
                    "0";

        }


        if (
            this.elements.remainingCount
        ) {

            this.elements
                .remainingCount
                .textContent =
                    "0";

        }


        if (
            this.elements.reviewCount
        ) {

            this.elements
                .reviewCount
                .textContent =
                    "0";

        }


        /*
        --------------------------------------------------
        Timer
        --------------------------------------------------
        */

        if (
            this.elements.timer
        ) {

            this.elements
                .timer
                .textContent =
                    "00:00:00";


            this.elements
                .timer
                .classList
                .remove(
                    "warning",
                    "danger"
                );

        }


        /*
        --------------------------------------------------
        Tempo decorrido
        --------------------------------------------------
        */

        if (
            this.elements.elapsedTime
        ) {

            this.elements
                .elapsedTime
                .textContent =
                    "00:00:00";

        }


        /*
        --------------------------------------------------
        Progresso
        --------------------------------------------------
        */

        if (
            this.elements.examProgress
        ) {

            if (
                "value" in
                this.elements.examProgress
            ) {

                this.elements
                    .examProgress
                    .value =
                        0;

            }


            this.elements
                .examProgress
                .style.width =
                    "0%";


            this.elements
                .examProgress
                .setAttribute(
                    "aria-valuenow",
                    "0"
                );

        }


        if (
            this.elements.progressText
        ) {

            this.elements
                .progressText
                .textContent =
                    "0%";

        }

    }


    /*
    ======================================================
    QUANTIDADE DISPONÍVEL NO BANCO
    ======================================================
    */

    getAvailableQuestionCount() {

        if (
            !this.engine
        ) {

            return 0;

        }


        /*
        --------------------------------------------------
        API direta do ExamEngine
        --------------------------------------------------
        */

        if (
            typeof this.engine
                .getAvailableQuestionCount ===
                "function"
        ) {

            return Number(
                this.engine
                    .getAvailableQuestionCount()
            ) || 0;

        }


        /*
        --------------------------------------------------
        Obtém QuestionManager
        --------------------------------------------------
        */

        let manager = null;


        if (
            typeof this.engine
                .getQuestionManager ===
                "function"
        ) {

            manager =
                this.engine
                    .getQuestionManager();

        }
        else if (
            this.engine.questionManager
        ) {

            manager =
                this.engine
                    .questionManager;

        }


        if (!manager) {

            return 0;

        }


        /*
        --------------------------------------------------
        QuestionManager.getCount()
        --------------------------------------------------
        */

        if (
            typeof manager
                .getCount ===
                "function"
        ) {

            return Number(
                manager
                    .getCount()
            ) || 0;

        }


        /*
        --------------------------------------------------
        QuestionManager.getAll()
        --------------------------------------------------
        */

        if (
            typeof manager
                .getAll ===
                "function"
        ) {

            const questions =
                manager
                    .getAll();


            return Array.isArray(
                questions
            )
                ? questions.length
                : 0;

        }


        /*
        --------------------------------------------------
        Array interno
        --------------------------------------------------
        */

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
    MOSTRAR TELA
    ======================================================
    */

    showScreen(
        element
    ) {

        if (!element) {

            return;

        }


        const screens = [

            this.elements.startScreen,

            this.elements.examScreen,

            this.elements.resultScreen,

            this.elements.errorScreen

        ];


        screens.forEach(
            screen => {

                if (
                    !screen ||
                    screen === element
                ) {

                    return;

                }


                screen.classList
                    .remove(
                        "active"
                    );


                screen.classList
                    .add(
                        "hidden"
                    );


                screen.setAttribute(
                    "hidden",
                    ""
                );


                screen.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );


        /*
        --------------------------------------------------
        Mostra a tela solicitada
        --------------------------------------------------
        */

        element.classList
            .remove(
                "hidden"
            );


        element.classList
            .add(
                "active"
            );


        element.removeAttribute(
            "hidden"
        );


        element.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /*
    ======================================================
    ESCONDER TELA
    ======================================================
    */

    hideScreen(
        element
    ) {

        if (!element) {

            return;

        }


        element.classList
            .remove(
                "active"
            );


        element.classList
            .add(
                "hidden"
            );


        element.setAttribute(
            "hidden",
            ""
        );


        element.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*
    ======================================================
    ESCONDER ELEMENTO
    ======================================================
    */

    hideElement(
        element
    ) {

        if (!element) {

            return;

        }


        element.classList
            .add(
                "hidden"
            );


        element.setAttribute(
            "hidden",
            ""
        );


        element.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    /*
    ======================================================
    MOSTRAR ELEMENTO
    ======================================================
    */

    showElement(
        element
    ) {

        if (!element) {

            return;

        }


        element.classList
            .remove(
                "hidden"
            );


        element.removeAttribute(
            "hidden"
        );


        element.setAttribute(
            "aria-hidden",
            "false"
        );

    }


    /*
    ======================================================
    MOSTRAR ERRO
    ======================================================
    */

    showError(
        message
    ) {

        const errorMessage =
            String(
                message ||
                "Ocorreu um erro inesperado."
            );


        console.error(
            "ExamUI:",
            errorMessage
        );


        /*
        --------------------------------------------------
        Tela dedicada de erro
        --------------------------------------------------
        */

        if (
            this.elements.errorScreen
        ) {

            const messageElement =
                this.elements
                    .errorScreen
                    .querySelector(
                        "[data-error-message]"
                    ) ||
                this.elements
                    .errorScreen
                    .querySelector(
                        ".error-message"
                    );


            if (
                messageElement
            ) {

                messageElement
                    .textContent =
                        errorMessage;

            }


            this.showScreen(
                this.elements.errorScreen
            );


            return;

        }


        /*
        --------------------------------------------------
        Fallback
        --------------------------------------------------
        */

        window.alert(
            errorMessage
        );

    }


    /*
    ======================================================
    ESTADO PÚBLICO DA INTERFACE
    ======================================================
    */

    isRunning() {

        return this.examRunning;

    }


    isFinished() {

        return this.examFinished;

    }


    getSelectedMode() {

        return this.selectedMode;

    }


    /*
    ======================================================
    CONFIGURAÇÃO DO MODO SELECIONADO
    ======================================================
    */

    getSelectedModeConfig() {

        return (
            this.examModes[
                this.selectedMode
            ] ||
            this.examModes.standard
        );

    }


    /*
    ======================================================
    ATUALIZAR DOMÍNIO VISUAL
    ======================================================
    */

    setDomainName(
        domainName
    ) {

        const value =
            domainName ||
            "Network Fundamentals";


        if (
            this.elements.startDomainName
        ) {

            this.elements
                .startDomainName
                .textContent =
                    value;

        }


        if (
            this.elements.examDomainName
        ) {

            this.elements
                .examDomainName
                .textContent =
                    value;

        }

    }


    /*
    ======================================================
    ATUALIZAR QUANTIDADE VISUAL DO BANCO
    ======================================================
    */

    updateQuestionBankSize() {

        if (
            !this.elements.questionBankSize
        ) {

            return;

        }


        this.elements
            .questionBankSize
            .textContent =
                String(
                    this.getAvailableQuestionCount()
                );

    }


    /*
    ======================================================
    HABILITAR BOTÃO DE INÍCIO
    ======================================================
    */

    enableStartButton() {

        if (
            !this.elements.startExamButton
        ) {

            return;

        }


        this.elements
            .startExamButton
            .disabled =
                false;

    }


    /*
    ======================================================
    DESABILITAR BOTÃO DE INÍCIO
    ======================================================
    */

    disableStartButton() {

        if (
            !this.elements.startExamButton
        ) {

            return;

        }


        this.elements
            .startExamButton
            .disabled =
                true;

    }


    /*
    ======================================================
    SINCRONIZAR QUESTÃO ATUAL
    ======================================================
    */

    syncCurrentQuestion() {

        if (
            !this.examRunning
        ) {

            return;

        }


        this.renderCurrentQuestion();

        this.updateInterface();

        this.updateNavigationRenderer();

    }


    /*
    ======================================================
    RENDERIZAR RESULTADO MANUALMENTE
    ======================================================
    */

    renderResult(
        result
    ) {

        if (
            !this.resultRenderer ||
            typeof this.resultRenderer
                .render !==
                "function"
        ) {

            return;

        }


        this.resultRenderer
            .render(
                result
            );

    }


    /*
    ======================================================
    LIMPAR RESULTADO
    ======================================================
    */

    clearResult() {

        if (
            !this.resultRenderer ||
            typeof this.resultRenderer
                .clear !==
                "function"
        ) {

            return;

        }


        this.resultRenderer
            .clear();

    }


    /*
    ======================================================
    LIMPAR NAVEGAÇÃO
    ======================================================
    */

    clearNavigation() {

        if (
            !this.navigationRenderer ||
            typeof this.navigationRenderer
                .clear !==
                "function"
        ) {

            return;

        }


        this.navigationRenderer
            .clear();

    }


    /*
    ======================================================
    DESTRUIR INTERFACE
    ======================================================
    */

    destroy() {

        /*
        --------------------------------------------------
        Interrompe timer se houver API disponível
        --------------------------------------------------
        */

        if (
            this.engine &&
            typeof this.engine
                .stopTimer ===
                "function"
        ) {

            this.engine
                .stopTimer();

        }


        this.clearNavigation();

        this.clearResult();


        this.examRunning =
            false;

        this.examFinished =
            false;

        this.initialized =
            false;

    }


    /*
    ======================================================
    DIAGNÓSTICO
    ======================================================
    */

    getDebugState() {

        return {

            initialized:
                this.initialized,

            examRunning:
                this.examRunning,

            examFinished:
                this.examFinished,

            selectedMode:
                this.selectedMode,

            availableQuestions:
                this.getAvailableQuestionCount(),

            examQuestions:
                this.getExamQuestionCount(),

            currentQuestionIndex:
                this.getCurrentQuestionIndex(),

            finishModalOpen:
                this.isFinishModalOpen()

        };

    }


    /*
    ======================================================
    ALIASES DO MODAL
    ======================================================
    */

    showFinishModal() {

        this.openFinishModal();

    }


    hideFinishModal() {

        this.closeFinishModal();

    }


    /*
    ======================================================
    EXIBIR TELA INICIAL
    ======================================================
    */

    showStartScreen() {

        this.examRunning =
            false;

        this.examFinished =
            false;


        this.closeFinishModal();


        if (
            this.elements.startScreen
        ) {

            this.showScreen(
                this.elements.startScreen
            );

        }


        this.updateQuestionBankSize();

    }


    /*
    ======================================================
    EXIBIR TELA DO EXAME
    ======================================================
    */

    showExamScreen() {

        if (
            this.elements.examScreen
        ) {

            this.showScreen(
                this.elements.examScreen
            );

        }

    }


    /*
    ======================================================
    EXIBIR TELA DE RESULTADO
    ======================================================
    */

    showResultScreen() {

        if (
            this.elements.resultScreen
        ) {

            this.showScreen(
                this.elements.resultScreen
            );

        }

    }


    /*
    ======================================================
    VERIFICAR INICIALIZAÇÃO
    ======================================================
    */

    isInitialized() {

        return this.initialized;

    }


    /*
    ======================================================
    OBTER ENGINE
    ======================================================
    */

    getEngine() {

        return this.engine;

    }


    /*
    ======================================================
    OBTER ELEMENTOS
    ======================================================
    */

    getElements() {

        return this.elements;

    }


    /*
    ======================================================
    OBTER RENDERIZADORES
    ======================================================
    */

    getQuestionRenderer() {

        return this.questionRenderer;

    }


    getNavigationRenderer() {

        return this.navigationRenderer;

    }


    getResultRenderer() {

        return this.resultRenderer;

    }


    getLabRenderer() {

        return this.labRenderer;

    }


    getReviewRenderer() {

        return this.reviewRenderer;

    }


   }


/*
==========================================================
DISPONIBILIZAÇÃO GLOBAL
==========================================================

O projeto utiliza scripts JavaScript tradicionais.

ExamUI precisa estar disponível em window para que
js/app.js consiga localizar e instanciar a classe.
==========================================================
*/

window.ExamUI =
    ExamUI;


/*
==========================================================
DIAGNÓSTICO DE CARREGAMENTO
==========================================================
*/

console.log(
    "ExamUI loaded successfully."
);
