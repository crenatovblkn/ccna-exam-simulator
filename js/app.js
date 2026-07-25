/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
Application Bootstrap

Responsabilidade:
- Inicializar toda a aplicação
- Carregar o banco de questões
- Criar QuestionManager
- Criar ExamEngine
- Criar StorageManager
- Criar renderizadores
- Criar ExamUI
- Conectar todos os componentes
- Iniciar o simulador

Este é o ponto de entrada principal da aplicação.
==========================================================
*/

(function () {

    "use strict";


    /*
    ======================================================
    CONFIGURAÇÃO
    ======================================================
    */

    const APP_CONFIG = {

        title:
            "Cisco CCNA 200-301",

        /*
        Banco inicial:
        Domain 1 — Network Fundamentals
        */

        questionBank:
            "data/network-fundamentals.json",

        storagePrefix:
            "ccna-simulator",

        storageVersion:
            "1.0",

        autoSaveInterval:
            5000

    };


    /*
    ======================================================
    REFERÊNCIAS GLOBAIS DA APLICAÇÃO
    ======================================================
    */

    let questionManager = null;

    let examEngine = null;

    let storageManager = null;

    let labRenderer = null;

    let questionRenderer = null;

    let navigationRenderer = null;

    let resultRenderer = null;

    let examUI = null;


    /*
    ======================================================
    INICIALIZAÇÃO
    ======================================================
    */

    async function initializeApplication() {

        try {

            console.log(
                "CCNA Exam Simulator: initializing..."
            );


            /*
            ------------------------------------------------
            1. Verifica dependências
            ------------------------------------------------
            */

            validateDependencies();


            /*
            ------------------------------------------------
            2. Storage
            ------------------------------------------------
            */

            storageManager =
                new StorageManager({

                    prefix:
                        APP_CONFIG.storagePrefix,

                    version:
                        APP_CONFIG.storageVersion

                });


            /*
            ------------------------------------------------
            3. Question Manager
            ------------------------------------------------
            */

            questionManager =
                new QuestionManager();


            /*
            ------------------------------------------------
            4. Carrega banco
            ------------------------------------------------
            */

            await loadQuestionBank();


            /*
            ------------------------------------------------
            5. Exam Engine
            ------------------------------------------------
            */

            examEngine =
                new ExamEngine({

                    questionManager:
                        questionManager

                });


            /*
            ------------------------------------------------
            6. Lab Renderer
            ------------------------------------------------
            */

            labRenderer =
                new LabRenderer({

                    engine:
                        examEngine,

                    container:
                        document.getElementById(
                            "answerContainer"
                        )

                });


            /*
            ------------------------------------------------
            7. Question Renderer
            ------------------------------------------------
            */

            questionRenderer =
                new QuestionRenderer({

                    engine:
                        examEngine,

                    labRenderer:
                        labRenderer

                });


            /*
            ------------------------------------------------
            8. Navigation Renderer
            ------------------------------------------------
            */

            navigationRenderer =
                new NavigationRenderer({

                    engine:
                        examEngine

                });


            /*
            ------------------------------------------------
            9. Result Renderer
            ------------------------------------------------
            */

            resultRenderer =
                new ResultRenderer({

                    engine:
                        examEngine,

                    container:
                        document.getElementById(
                            "resultsScreen"
                        )

                });


            /*
            ------------------------------------------------
            10. Exam UI
            ------------------------------------------------
            */

            examUI =
                new ExamUI({

                    engine:
                        examEngine,

                    storageManager:
                        storageManager,

                    questionRenderer:
                        questionRenderer,

                    navigationRenderer:
                        navigationRenderer,

                    resultRenderer:
                        resultRenderer,

                    labRenderer:
                        labRenderer

                });


            /*
            ------------------------------------------------
            11. Inicializa interface
            ------------------------------------------------
            */

            examUI.init();


            /*
            ------------------------------------------------
            12. Exposição para debug
            ------------------------------------------------
            */

            exposeDebugObjects();


            console.log(
                "CCNA Exam Simulator: ready."
            );


            console.log(
                `Question bank: ${getQuestionCount()} questions.`
            );

        } catch (error) {

            console.error(
                "CCNA Exam Simulator failed to initialize.",
                error
            );


            showFatalError(
                error
            );

        }

    }


    /*
    ======================================================
    DEPENDÊNCIAS
    ======================================================
    */

    function validateDependencies() {

        const dependencies = [

            "Answer",
            "Question",
            "Exam",
            "QuestionManager",
            "ExamEngine",
            "StorageManager",
            "QuestionRenderer",
            "NavigationRenderer",
            "LabRenderer",
            "ResultRenderer",
            "ExamUI"

        ];


        const missing =
            dependencies.filter(
                dependency =>
                    typeof window[
                        dependency
                    ] ===
                    "undefined"
            );


        if (
            missing.length > 0
        ) {

            throw new Error(
                "Missing application dependencies: " +
                missing.join(", ")
            );

        }

    }


    /*
    ======================================================
    CARREGAR BANCO
    ======================================================
    */

    async function loadQuestionBank() {

        if (
            typeof questionManager
                .loadFromURL ===
                "function"
        ) {

            await questionManager
                .loadFromURL(
                    APP_CONFIG.questionBank
                );


            validateQuestionBank();


            return;

        }


        /*
        --------------------------------------------------
        Fallback usando fetch
        --------------------------------------------------
        */

        const response =
            await fetch(
                APP_CONFIG.questionBank,
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load question bank: HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        const questions =
            Array.isArray(data)
                ? data
                : data.questions;


        if (
            !Array.isArray(
                questions
            )
        ) {

            throw new Error(
                "Invalid question bank format."
            );

        }


        if (
            typeof questionManager
                .load ===
                "function"
        ) {

            questionManager.load(
                questions
            );

        } else if (
            typeof questionManager
                .setQuestions ===
                "function"
        ) {

            questionManager
                .setQuestions(
                    questions
                );

        } else if (
            typeof questionManager
                .addQuestion ===
                "function"
        ) {

            questions.forEach(
                data => {

                    const question =
                        data instanceof Question
                            ? data
                            : new Question(
                                data
                            );


                    questionManager
                        .addQuestion(
                            question
                        );

                }
            );

        } else {

            throw new Error(
                "QuestionManager has no supported method for loading questions."
            );

        }


        validateQuestionBank();

    }


    /*
    ======================================================
    VALIDAR BANCO
    ======================================================
    */

    function validateQuestionBank() {

        const total =
            getQuestionCount();


        if (
            total <= 0
        ) {

            throw new Error(
                "The question bank is empty."
            );

        }


        console.log(
            `${total} questions loaded successfully.`
        );


        if (
            total < 180
        ) {

            console.warn(
                `Network Fundamentals bank currently contains ${total}/180 questions.`
            );

        }

    }


    /*
    ======================================================
    QUANTIDADE DE QUESTÕES
    ======================================================
    */

    function getQuestionCount() {

        if (!questionManager) {

            return 0;

        }


        if (
            typeof questionManager
                .getTotalQuestions ===
                "function"
        ) {

            return Number(
                questionManager
                    .getTotalQuestions()
            ) || 0;

        }


        if (
            typeof questionManager
                .getQuestions ===
                "function"
        ) {

            const questions =
                questionManager
                    .getQuestions();


            return Array.isArray(
                questions
            )
                ? questions.length
                : 0;

        }


        if (
            Array.isArray(
                questionManager.questions
            )
        ) {

            return questionManager
                .questions
                .length;

        }


        return 0;

    }


    /*
    ======================================================
    ERRO FATAL
    ======================================================
    */

    function showFatalError(error) {

        const examScreen =
            document.getElementById(
                "examScreen"
            );


        /*
        CORREÇÃO:
        O ID utilizado pelo index.html é resultsScreen.
        */

        const resultScreen =
            document.getElementById(
                "resultsScreen"
            );


        if (examScreen) {

            examScreen.classList.add(
                "hidden"
            );

        }


        if (resultScreen) {

            resultScreen.classList.add(
                "hidden"
            );

        }


        const startScreen =
            document.getElementById(
                "startScreen"
            );


        if (!startScreen) {

            return;

        }


        startScreen.classList.remove(
            "hidden"
        );


        startScreen.classList.add(
            "active"
        );


        const previous =
            document.getElementById(
                "applicationFatalError"
            );


        if (previous) {

            previous.remove();

        }


        const errorBox =
            document.createElement(
                "div"
            );


        errorBox.id =
            "applicationFatalError";


        errorBox.className =
            "application-error";


        const title =
            document.createElement(
                "strong"
            );


        title.textContent =
            "Unable to initialize exam simulator";


        const message =
            document.createElement(
                "p"
            );


        message.textContent =
            getFriendlyErrorMessage(
                error
            );


        errorBox.appendChild(
            title
        );

        errorBox.appendChild(
            message
        );


        const card =
            startScreen.querySelector(
                ".start-card"
            );


        if (card) {

            card.appendChild(
                errorBox
            );

        } else {

            startScreen.appendChild(
                errorBox
            );

        }


        const startButton =
            document.getElementById(
                "startExamButton"
            );


        if (startButton) {

            startButton.disabled =
                true;

        }

    }


    /*
    ======================================================
    MENSAGEM DE ERRO AMIGÁVEL
    ======================================================
    */

    function getFriendlyErrorMessage(
        error
    ) {

        const message =
            error &&
            error.message
                ? error.message
                : String(error);


        if (
            window.location.protocol ===
            "file:"
        ) {

            return (
                "The simulator could not load the question bank. " +
                "This browser may block local JSON files when the " +
                "project is opened directly from the filesystem."
            );

        }


        return message;

    }


    /*
    ======================================================
    DEBUG
    ======================================================
    */

    function exposeDebugObjects() {

        window.CCNASimulator = {

            config:
                APP_CONFIG,

            questionManager:
                questionManager,

            engine:
                examEngine,

            storage:
                storageManager,

            ui:
                examUI,

            renderers: {

                question:
                    questionRenderer,

                navigation:
                    navigationRenderer,

                lab:
                    labRenderer,

                result:
                    resultRenderer

            },

            getQuestionCount:
                getQuestionCount

        };

    }


    /*
    ======================================================
    PROTEÇÃO CONTRA ERROS NÃO TRATADOS
    ======================================================
    */

    window.addEventListener(
        "error",
        event => {

            console.error(
                "Application error:",
                event.error ||
                event.message
            );

        }
    );


    window.addEventListener(
        "unhandledrejection",
        event => {

            console.error(
                "Unhandled promise rejection:",
                event.reason
            );

        }
    );


    /*
    ======================================================
    START
    ======================================================
    */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializeApplication
        );

    } else {

        initializeApplication();

    }

})();
