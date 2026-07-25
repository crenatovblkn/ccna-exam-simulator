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
        banco completo / modo de estudo
        ==================================================
        */

        this.examModes = {

            quick: {

                questionCount:
                    20,

                duration:
                    30 * 60,

                label:
                    "Prática Rápida"

            },

            standard: {

                questionCount:
                    60,

                duration:
                    90 * 60,

                label:
                    "Simulado"

            },

            full: {

                questionCount:
                    180,

                /*
                0 significa sem limite de tempo.
                */

                duration:
                    0,

                label:
                    "Banco Completo"

            }

        };


        /*
        ==================================================
        ELEMENTOS DA INTERFACE

        Serão preenchidos em cacheElements().
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
        O projeto consolidado utiliza resultScreen.

        Há fallback para resultsScreen para impedir que uma
        diferença temporária no HTML impeça a inicialização.
        --------------------------------------------------
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
        RADIOS DOS MODOS
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
            Object.entries(
                required
            )
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
        Banco de questões
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
        Seleciona modo marcado no HTML
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
        Contadores iniciais
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
        MODOS DE EXAME
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
        INICIAR
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
        ANTERIOR
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


                    this.engine
                        .previousQuestion();

                }
            );


        /*
        --------------------------------------------------
        PRÓXIMA
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


                    this.engine
                        .nextQuestion();

                }
            );


        /*
        --------------------------------------------------
        REVISÃO
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


                    this.engine
                        .toggleReview();

                }
            );


        /*
        --------------------------------------------------
        FINALIZAR
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
        ESC
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
        RELOAD
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

                        window.location
                            .reload();

                    }
                );

        }

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
            () => {

                this.examRunning =
                    true;

                this.examFinished =
                    false;


                this.showScreen(
                    this.elements.examScreen
                );


                this.hideScreen(
                    this.elements.startScreen
                );


                this.hideScreen(
                    this.elements.resultScreen
                );


                this.renderCurrentQuestion();


                this.updateInterface();


                /*
                Inicia o timer somente quando existe
                duração configurada.
                */

                if (
                    this.engine
                        .getRemainingTime() > 0
                ) {

                    this.engine
                        .startTimer();

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


                /*
                O QuestionRenderer pode precisar redesenhar
                a questão para refletir seleção/desmarcação.
                */

                this.renderCurrentQuestion();


                this.updateInterface();


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


                this.autoSave();

            }
        );


        /*
        --------------------------------------------------
        TEMPO ALTERADO
        --------------------------------------------------
        */

        this.engine.on(
            "timeChanged",
            payload => {

                if (
                    !this.examRunning
                ) {

                    return;

                }


                const remainingTime =
                    payload &&
                    Number.isFinite(
                        Number(
                            payload.remainingTime
                        )
                    )
                        ? Number(
                            payload.remainingTime
                        )
                        : this.engine
                            .getRemainingTime();


                const elapsedTime =
                    payload &&
                    Number.isFinite(
                        Number(
                            payload.elapsedTime
                        )
                    )
                        ? Number(
                            payload.elapsedTime
                        )
                        : this.engine
                            .getElapsedTime();


                this.updateTimer(
                    remainingTime
                );


                this.updateElapsedTime(
                    elapsedTime
                );

            }
        );


        /*
        --------------------------------------------------
        TEMPO ESGOTADO
        --------------------------------------------------
        */

        this.engine.on(
            "timeExpired",
            () => {

                this.closeFinishModal();

            }
        );


        /*
        --------------------------------------------------
        EXAME FINALIZADO
        --------------------------------------------------
        */

        this.engine.on(
            "examFinished",
            payload => {

                const result =
                    payload &&
                    payload.result
                        ? payload.result
                        : this.engine
                            .getResult();


                this.handleExamFinished(
                    result
                );

            }
        );


        /*
        --------------------------------------------------
        EXAME RESTAURADO
        --------------------------------------------------
        */

        this.engine.on(
            "examRestored",
            () => {

                this.examRunning =
                    true;

                this.examFinished =
                    false;


                this.hideScreen(
                    this.elements.startScreen
                );


                this.hideScreen(
                    this.elements.resultScreen
                );


                this.showScreen(
                    this.elements.examScreen
                );


                this.renderCurrentQuestion();


                this.updateInterface();


                if (
                    this.engine
                        .getRemainingTime() > 0
                ) {

                    this.engine
                        .startTimer();

                }

            }
        );


        /*
        --------------------------------------------------
        RESET
        --------------------------------------------------
        */

        this.engine.on(
            "examReset",
            () => {

                this.examRunning =
                    false;

                this.examFinished =
                    false;


                this.closeFinishModal();


                this.prepareInitialScreen();

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
        RESULT RENDERER

        O ResultRenderer possui callbacks para:
        - novo exame
        - fechar resultado

        Ambos retornam para a tela inicial de forma
        controlada.
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
                typeof this.resultRenderer
                    .setOnClose ===
                    "function"
            ) {

                this.resultRenderer
                    .setOnClose(
                        () => {

                            this.closeResultScreen();

                        }
                    );

            }


            /*
            Compatibilidade com implementações que usam
            propriedades públicas em vez de setters.
            */

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


            if (
                "onClose" in
                this.resultRenderer
            ) {

                this.resultRenderer
                    .onClose =
                        () => {

                            this.closeResultScreen();

                        };

            }

        }


        /*
        --------------------------------------------------
        NAVIGATION RENDERER

        Caso o renderer permita callback explícito,
        utilizamos o ExamEngine como controlador.
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

                            this.engine
                                .goToQuestion(
                                    index
                                );

                        }
                    );

            }

        }

    }


    /*
    ======================================================
    INICIAR EXAME A PARTIR DA INTERFACE
    ======================================================
    */

    startExamFromUI() {

        if (
            this.examRunning
        ) {

            return;

        }


        /*
        --------------------------------------------------
        Descobre o modo selecionado
        --------------------------------------------------
        */

        const checked =
            this.elements
                .examModeInputs
                .find(
                    input =>
                        input.checked
                );


        let modeName =
            checked
                ? checked.value
                : this.selectedMode;


        /*
        --------------------------------------------------
        Compatibilidade com HTML antigo que eventualmente
        use valores numéricos.
        --------------------------------------------------
        */

        if (
            !this.examModes[
                modeName
            ]
        ) {

            const numericMode =
                Number(
                    modeName
                );


            if (
                numericMode === 20
            ) {

                modeName =
                    "quick";

            } else if (
                numericMode === 60
            ) {

                modeName =
                    "standard";

            } else if (
                numericMode === 180
            ) {

                modeName =
                    "full";

            } else {

                modeName =
                    "standard";

            }

        }


        this.selectedMode =
            modeName;


        const mode =
            this.examModes[
                modeName
            ];


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
                "Nenhuma questão está disponível para iniciar o exame."
            );


            return;

        }


        /*
        --------------------------------------------------
        O modo full usa até 180 questões, limitado pelo
        tamanho real do banco.
        --------------------------------------------------
        */

        const questionCount =
            Math.min(
                mode.questionCount,
                available
            );


        /*
        --------------------------------------------------
        Reseta estado visual
        --------------------------------------------------
        */

        this.examFinished =
            false;


        this.closeFinishModal();


        /*
        --------------------------------------------------
        Limpa renderizadores antes da nova tentativa
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
        Inicia pelo ExamEngine
        --------------------------------------------------
        */

        try {

            this.engine
                .startExam({

                    title:
                        "Cisco CCNA 200-301",

                    domain:
                        "Network Fundamentals",

                    questionCount:
                        questionCount,

                    duration:
                        mode.duration,

                    passingScore:
                        70

                });

        } catch (error) {

            console.error(
                "ExamUI: erro ao iniciar exame.",
                error
            );


            this.showError(
                error &&
                error.message
                    ? error.message
                    : "Não foi possível iniciar o exame."
            );

        }

    }


    /*
    ======================================================
    RENDERIZAR QUESTÃO ATUAL
    ======================================================
    */

    renderCurrentQuestion() {

        if (
            !this.questionRenderer
        ) {

            return;

        }


        /*
        --------------------------------------------------
        Interface principal esperada
        --------------------------------------------------
        */

        if (
            typeof this.questionRenderer
                .render ===
                "function"
        ) {

            this.questionRenderer
                .render();


            return;

        }


        /*
        --------------------------------------------------
        Compatibilidade
        --------------------------------------------------
        */

        if (
            typeof this.questionRenderer
                .renderCurrentQuestion ===
                "function"
        ) {

            this.questionRenderer
                .renderCurrentQuestion();

        }

    }


    /*
    ======================================================
    ATUALIZAR INTERFACE
    ======================================================
    */

    updateInterface() {

        if (
            !this.engine ||
            !this.engine.hasExam()
        ) {

            return;

        }


        const state =
            this.engine
                .getState();


        const progress =
            state.progress ||
            this.engine
                .getProgress();


        /*
        --------------------------------------------------
        Questão atual / total
        --------------------------------------------------
        */

        if (
            this.elements.questionCounter
        ) {

            this.elements
                .questionCounter
                .textContent =
                    `${progress.current} / ${progress.total}`;

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
                        progress.answered
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
                        progress.remaining
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
                        progress.review
                    );

        }


        /*
        --------------------------------------------------
        Barra de progresso
        --------------------------------------------------
        */

        this.updateProgress(
            progress
        );


        /*
        --------------------------------------------------
        Botões
        --------------------------------------------------
        */

        this.updateNavigationButtons();


        this.updateReviewButton();


        /*
        --------------------------------------------------
        Timer
        --------------------------------------------------
        */

        this.updateTimer(
            state.remainingTime
        );


        this.updateElapsedTime(
            state.elapsedTime
        );


        /*
        --------------------------------------------------
        Navigation Renderer
        --------------------------------------------------
        */

        this.updateNavigationRenderer();

    }


    /*
    ======================================================
    ATUALIZAR PROGRESSO
    ======================================================
    */

    updateProgress(
        progress
    ) {

        if (!progress) {

            return;

        }


        const percent =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        progress.percent
                    ) || 0
                )
            );


        /*
        --------------------------------------------------
        <progress>
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
                    .max =
                        100;


                this.elements
                    .examProgress
                    .value =
                        percent;

            }


            /*
            Compatibilidade com barra baseada em CSS.
            */

            this.elements
                .examProgress
                .style.width =
                    `${percent}%`;


            this.elements
                .examProgress
                .setAttribute(
                    "aria-valuenow",
                    String(
                        percent
                    )
                );

        }


        /*
        --------------------------------------------------
        Texto
        --------------------------------------------------
        */

        if (
            this.elements.progressText
        ) {

            this.elements
                .progressText
                .textContent =
                    `${percent}%`;

        }

    }


    /*
    ======================================================
    BOTÕES DE NAVEGAÇÃO
    ======================================================
    */

    updateNavigationButtons() {

        if (
            this.elements.previousButton
        ) {

            this.elements
                .previousButton
                .disabled =
                    !this.engine
                        .hasPrevious();

        }


        if (
            this.elements.nextButton
        ) {

            this.elements
                .nextButton
                .disabled =
                    !this.engine
                        .hasNext();

        }

    }


    /*
    ======================================================
    BOTÃO DE REVISÃO
    ======================================================
    */

    updateReviewButton() {

        if (
            !this.elements.reviewButton
        ) {

            return;

        }


        const marked =
            this.engine
                .isCurrentQuestionMarkedForReview();


        this.elements
            .reviewButton
            .classList
            .toggle(
                "active",
                marked
            );


        this.elements
            .reviewButton
            .classList
            .toggle(
                "selected",
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
            () => {

                this.examRunning =
                    true;

                this.examFinished =
                    false;


                this.showScreen(
                    this.elements.examScreen
                );


                this.hideScreen(
                    this.elements.startScreen
                );


                this.hideScreen(
                    this.elements.resultScreen
                );


                this.renderCurrentQuestion();


                this.updateInterface();


                /*
                Inicia o timer somente quando existe
                duração configurada.
                */

                if (
                    this.engine
                        .getRemainingTime() > 0
                ) {

                    this.engine
                        .startTimer();

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


                /*
                O QuestionRenderer pode precisar redesenhar
                a questão para refletir seleção/desmarcação.
                */

                this.renderCurrentQuestion();


                this.updateInterface();


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


                this.autoSave();

            }
        );


        /*
        --------------------------------------------------
        TEMPO ALTERADO
        --------------------------------------------------
        */

        this.engine.on(
            "timeChanged",
            payload => {

                if (
                    !this.examRunning
                ) {

                    return;

                }


                const remainingTime =
                    payload &&
                    Number.isFinite(
                        Number(
                            payload.remainingTime
                        )
                    )
                        ? Number(
                            payload.remainingTime
                        )
                        : this.engine
                            .getRemainingTime();


                const elapsedTime =
                    payload &&
                    Number.isFinite(
                        Number(
                            payload.elapsedTime
                        )
                    )
                        ? Number(
                            payload.elapsedTime
                        )
                        : this.engine
                            .getElapsedTime();


                this.updateTimer(
                    remainingTime
                );


                this.updateElapsedTime(
                    elapsedTime
                );

            }
        );


        /*
        --------------------------------------------------
        TEMPO ESGOTADO
        --------------------------------------------------
        */

        this.engine.on(
            "timeExpired",
            () => {

                this.closeFinishModal();

            }
        );


        /*
        --------------------------------------------------
        EXAME FINALIZADO
        --------------------------------------------------
        */

        this.engine.on(
            "examFinished",
            payload => {

                const result =
                    payload &&
                    payload.result
                        ? payload.result
                        : this.engine
                            .getResult();


                this.handleExamFinished(
                    result
                );

            }
        );


        /*
        --------------------------------------------------
        EXAME RESTAURADO
        --------------------------------------------------
        */

        this.engine.on(
            "examRestored",
            () => {

                this.examRunning =
                    true;

                this.examFinished =
                    false;


                this.hideScreen(
                    this.elements.startScreen
                );


                this.hideScreen(
                    this.elements.resultScreen
                );


                this.showScreen(
                    this.elements.examScreen
                );


                this.renderCurrentQuestion();


                this.updateInterface();


                if (
                    this.engine
                        .getRemainingTime() > 0
                ) {

                    this.engine
                        .startTimer();

                }

            }
        );


        /*
        --------------------------------------------------
        RESET
        --------------------------------------------------
        */

        this.engine.on(
            "examReset",
            () => {

                this.examRunning =
                    false;

                this.examFinished =
                    false;


                this.closeFinishModal();


                this.prepareInitialScreen();

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
        RESULT RENDERER

        O ResultRenderer possui callbacks para:
        - novo exame
        - fechar resultado

        Ambos retornam para a tela inicial de forma
        controlada.
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
                typeof this.resultRenderer
                    .setOnClose ===
                    "function"
            ) {

                this.resultRenderer
                    .setOnClose(
                        () => {

                            this.closeResultScreen();

                        }
                    );

            }


            /*
            Compatibilidade com implementações que usam
            propriedades públicas em vez de setters.
            */

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


            if (
                "onClose" in
                this.resultRenderer
            ) {

                this.resultRenderer
                    .onClose =
                        () => {

                            this.closeResultScreen();

                        };

            }

        }


        /*
        --------------------------------------------------
        NAVIGATION RENDERER

        Caso o renderer permita callback explícito,
        utilizamos o ExamEngine como controlador.
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

                            this.engine
                                .goToQuestion(
                                    index
                                );

                        }
                    );

            }

        }

    }


    /*
    ======================================================
    INICIAR EXAME A PARTIR DA INTERFACE
    ======================================================
    */

    startExamFromUI() {

        if (
            this.examRunning
        ) {

            return;

        }


        /*
        --------------------------------------------------
        Descobre o modo selecionado
        --------------------------------------------------
        */

        const checked =
            this.elements
                .examModeInputs
                .find(
                    input =>
                        input.checked
                );


        let modeName =
            checked
                ? checked.value
                : this.selectedMode;


        /*
        --------------------------------------------------
        Compatibilidade com HTML antigo que eventualmente
        use valores numéricos.
        --------------------------------------------------
        */

        if (
            !this.examModes[
                modeName
            ]
        ) {

            const numericMode =
                Number(
                    modeName
                );


            if (
                numericMode === 20
            ) {

                modeName =
                    "quick";

            } else if (
                numericMode === 60
            ) {

                modeName =
                    "standard";

            } else if (
                numericMode === 180
            ) {

                modeName =
                    "full";

            } else {

                modeName =
                    "standard";

            }

        }


        this.selectedMode =
            modeName;


        const mode =
            this.examModes[
                modeName
            ];


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
                "Nenhuma questão está disponível para iniciar o exame."
            );


            return;

        }


        /*
        --------------------------------------------------
        O modo full usa até 180 questões, limitado pelo
        tamanho real do banco.
        --------------------------------------------------
        */

        const questionCount =
            Math.min(
                mode.questionCount,
                available
            );


        /*
        --------------------------------------------------
        Reseta estado visual
        --------------------------------------------------
        */

        this.examFinished =
            false;


        this.closeFinishModal();


        /*
        --------------------------------------------------
        Limpa renderizadores antes da nova tentativa
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
        Inicia pelo ExamEngine
        --------------------------------------------------
        */

        try {

            this.engine
                .startExam({

                    title:
                        "Cisco CCNA 200-301",

                    domain:
                        "Network Fundamentals",

                    questionCount:
                        questionCount,

                    duration:
                        mode.duration,

                    passingScore:
                        70

                });

        } catch (error) {

            console.error(
                "ExamUI: erro ao iniciar exame.",
                error
            );


            this.showError(
                error &&
                error.message
                    ? error.message
                    : "Não foi possível iniciar o exame."
            );

        }

    }


    /*
    ======================================================
    RENDERIZAR QUESTÃO ATUAL
    ======================================================
    */

    renderCurrentQuestion() {

        if (
            !this.questionRenderer
        ) {

            return;

        }


        /*
        --------------------------------------------------
        Interface principal esperada
        --------------------------------------------------
        */

        if (
            typeof this.questionRenderer
                .render ===
                "function"
        ) {

            this.questionRenderer
                .render();


            return;

        }


        /*
        --------------------------------------------------
        Compatibilidade
        --------------------------------------------------
        */

        if (
            typeof this.questionRenderer
                .renderCurrentQuestion ===
                "function"
        ) {

            this.questionRenderer
                .renderCurrentQuestion();

        }

    }


    /*
    ======================================================
    ATUALIZAR INTERFACE
    ======================================================
    */

    updateInterface() {

        if (
            !this.engine ||
            !this.engine.hasExam()
        ) {

            return;

        }


        const state =
            this.engine
                .getState();


        const progress =
            state.progress ||
            this.engine
                .getProgress();


        /*
        --------------------------------------------------
        Questão atual / total
        --------------------------------------------------
        */

        if (
            this.elements.questionCounter
        ) {

            this.elements
                .questionCounter
                .textContent =
                    `${progress.current} / ${progress.total}`;

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
                        progress.answered
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
                        progress.remaining
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
                        progress.review
                    );

        }


        /*
        --------------------------------------------------
        Barra de progresso
        --------------------------------------------------
        */

        this.updateProgress(
            progress
        );


        /*
        --------------------------------------------------
        Botões
        --------------------------------------------------
        */

        this.updateNavigationButtons();


        this.updateReviewButton();


        /*
        --------------------------------------------------
        Timer
        --------------------------------------------------
        */

        this.updateTimer(
            state.remainingTime
        );


        this.updateElapsedTime(
            state.elapsedTime
        );


        /*
        --------------------------------------------------
        Navigation Renderer
        --------------------------------------------------
        */

        this.updateNavigationRenderer();

    }


    /*
    ======================================================
    ATUALIZAR PROGRESSO
    ======================================================
    */

    updateProgress(
        progress
    ) {

        if (!progress) {

            return;

        }


        const percent =
            Math.max(
                0,
                Math.min(
                    100,
                    Number(
                        progress.percent
                    ) || 0
                )
            );


        /*
        --------------------------------------------------
        <progress>
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
                    .max =
                        100;


                this.elements
                    .examProgress
                    .value =
                        percent;

            }


            /*
            Compatibilidade com barra baseada em CSS.
            */

            this.elements
                .examProgress
                .style.width =
                    `${percent}%`;


            this.elements
                .examProgress
                .setAttribute(
                    "aria-valuenow",
                    String(
                        percent
                    )
                );

        }


        /*
        --------------------------------------------------
        Texto
        --------------------------------------------------
        */

        if (
            this.elements.progressText
        ) {

            this.elements
                .progressText
                .textContent =
                    `${percent}%`;

        }

    }


    /*
    ======================================================
    BOTÕES DE NAVEGAÇÃO
    ======================================================
    */

    updateNavigationButtons() {

        if (
            this.elements.previousButton
        ) {

            this.elements
                .previousButton
                .disabled =
                    !this.engine
                        .hasPrevious();

        }


        if (
            this.elements.nextButton
        ) {

            this.elements
                .nextButton
                .disabled =
                    !this.engine
                        .hasNext();

        }

    }


    /*
    ======================================================
    BOTÃO DE REVISÃO
    ======================================================
    */

    updateReviewButton() {

        if (
            !this.elements.reviewButton
        ) {

            return;

        }


        const marked =
            this.engine
                .isCurrentQuestionMarkedForReview();


        this.elements
            .reviewButton
            .classList
            .toggle(
                "active",
                marked
            );


        this.elements
            .reviewButton
            .classList
            .toggle(
                "selected",
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

    }

    /*
    ======================================================
    FECHAR TELA DE RESULTADO
    ======================================================
    */

    closeResultScreen() {

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
        Reseta engine
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
            O evento examReset chamará
            prepareInitialScreen().
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
    NOVO EXAME
    ======================================================
    */

    restartApplication() {

        /*
        --------------------------------------------------
        Limpa resultado
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
        Limpa navegação
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
        Reseta engine
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


        if (
            this.elements.elapsedTime
        ) {

            this.elements
                .elapsedTime
                .textContent =
                    "00:00:00";

        }


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
    QUANTIDADE DISPONÍVEL
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
        ExamEngine consolidado
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
        Fallback pelo QuestionManager
        --------------------------------------------------
        */

        const manager =
            typeof this.engine
                .getQuestionManager ===
                "function"
                ? this.engine
                    .getQuestionManager()
                : null;


        if (!manager) {

            return 0;

        }


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


        /*
        --------------------------------------------------
        Esconde as demais telas principais
        --------------------------------------------------
        */

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

    }


    /*
    ======================================================
    MOSTRAR ERRO
    ======================================================
    */

    showError(
        message
    ) {

        console.error(
            "ExamUI:",
            message
        );


        /*
        --------------------------------------------------
        Se existir tela específica de erro
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


            if (messageElement) {

                messageElement
                    .textContent =
                        String(
                            message
                        );

            }


            this.showScreen(
                this.elements.errorScreen
            );


            return;

        }


        /*
        --------------------------------------------------
        Fallback sem tela de erro dedicada
        --------------------------------------------------
        */

        window.alert(
            String(
                message
            )
        );

    }


    /*
    ======================================================
    ESTADO PÚBLICO
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
    DESTROY
    ======================================================
    */

    destroy() {

        /*
        --------------------------------------------------
        Interrompe timer
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


        this.examRunning =
            false;

        this.examFinished =
            false;

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
