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
    REFERÊNCIAS GLOBAIS
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
                "CCNA Exam Simulator: initializing."
            );


            /*
            ------------------------------------------------
            1. Dependências
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

            IMPORTANTE:
            O ExamEngine consolidado recebe o
            QuestionManager diretamente.
            ------------------------------------------------
            */

            examEngine =
                new ExamEngine(
                    questionManager
                );


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
                            "resultScreen"
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
            12. Debug
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

        /*
    ======================================================
    CARREGAR BANCO DE QUESTÕES
    ======================================================
    */

    async function loadQuestionBank() {

        console.log(
            "CCNA Exam Simulator: loading question bank..."
        );

        /*
        --------------------------------------------------
        O QuestionManager atual possui loadFromURL(),
        responsável por:
        
        1. buscar o arquivo JSON;
        2. converter a resposta para objeto;
        3. chamar load(data);
        4. criar/validar as questões.
        --------------------------------------------------
        */

        if (
            typeof questionManager.loadFromURL !==
            "function"
        ) {

            throw new Error(
                "QuestionManager.loadFromURL() is not available."
            );

        }


        const loadedCount =
            await questionManager.loadFromURL(
                APP_CONFIG.questionBank
            );


        console.log(
            `CCNA Exam Simulator: ${loadedCount} questions loaded.`
        );


        /*
        --------------------------------------------------
        Validação final
        --------------------------------------------------
        */

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


        /*
        --------------------------------------------------
        Método oficial do QuestionManager atual
        --------------------------------------------------
        */

        if (
            typeof questionManager
                .getCount ===
                "function"
        ) {

            return Number(
                questionManager
                    .getCount()
            ) || 0;

        }


        /*
        --------------------------------------------------
        Compatibilidade
        --------------------------------------------------
        */

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


        /*
        --------------------------------------------------
        getAll()
        --------------------------------------------------
        */

        if (
            typeof questionManager
                .getAll ===
                "function"
        ) {

            const questions =
                questionManager
                    .getAll();


            return Array.isArray(
                questions
            )
                ? questions.length
                : 0;

        }


        /*
        --------------------------------------------------
        getQuestions()
        --------------------------------------------------
        */

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


        /*
        --------------------------------------------------
        Propriedade questions
        --------------------------------------------------
        */

        if (
            Array.isArray(
                questionManager.questions
            )
        ) {

            return questionManager
                .questions
                .length;

        }


        /*
        --------------------------------------------------
        Propriedade questionBank
        --------------------------------------------------
        */

        if (
            Array.isArray(
                questionManager.questionBank
            )
        ) {

            return questionManager
                .questionBank
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


        const resultScreen =
            document.getElementById(
                "resultScreen"
            );


        /*
        --------------------------------------------------
        Esconde telas que não devem permanecer visíveis
        --------------------------------------------------
        */

        [
            examScreen,
            resultScreen
        ].forEach(
            element => {

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

            }
        );


        /*
        --------------------------------------------------
        Recupera tela inicial
        --------------------------------------------------
        */

        const startScreen =
            document.getElementById(
                "startScreen"
            );


        if (!startScreen) {

            return;

        }


        startScreen.classList
            .remove(
                "hidden"
            );


        startScreen.classList
            .add(
                "active"
            );


        /*
        --------------------------------------------------
        Remove mensagem anterior
        --------------------------------------------------
        */

        const previous =
            document.getElementById(
                "applicationFatalError"
            );


        if (previous) {

            previous.remove();

        }


        /*
        --------------------------------------------------
        Cria caixa de erro
        --------------------------------------------------
        */

        const errorBox =
            document.createElement(
                "div"
            );


        errorBox.id =
            "applicationFatalError";


        errorBox.className =
            "application-error";


        /*
        --------------------------------------------------
        Título
        --------------------------------------------------
        */

        const title =
            document.createElement(
                "strong"
            );


        title.textContent =
            "Unable to initialize exam simulator";


        /*
        --------------------------------------------------
        Mensagem
        --------------------------------------------------
        */

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


        /*
        --------------------------------------------------
        Insere mensagem
        --------------------------------------------------
        */

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


        /*
        --------------------------------------------------
        Desabilita botão de início
        --------------------------------------------------
        */

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

    function getFriendlyErrorMessage(error) {

        const message =
            error &&
            error.message
                ? error.message
                : String(
                    error
                );


        /*
        --------------------------------------------------
        Projeto aberto diretamente por file://
        --------------------------------------------------
        */

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
