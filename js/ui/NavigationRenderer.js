/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
NavigationRenderer

Responsabilidade:
- Renderizar navegação lateral
- Mostrar todas as questões do exame
- Destacar questão atual
- Mostrar questões respondidas
- Mostrar questões não respondidas
- Mostrar questões marcadas para revisão
- Permitir navegação direta
- Atualizar contadores do exame

Este componente NÃO calcula pontuação.
==========================================================
*/

class NavigationRenderer {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor(options = {}) {

        this.engine =
            options.engine || null;

        this.elements = {};

        this.cacheElements();

    }


    /*
    ======================================================
    ELEMENTOS
    ======================================================
    */

    cacheElements() {

        this.elements.navigation =
            document.getElementById(
                "questionNavigation"
            );

        this.elements.currentQuestion =
            document.getElementById(
                "currentQuestionNumber"
            );

        this.elements.totalQuestions =
            document.getElementById(
                "totalQuestionCount"
            );

        this.elements.answeredCount =
            document.getElementById(
                "answeredCount"
            );

        this.elements.unansweredCount =
            document.getElementById(
                "unansweredCount"
            );

        this.elements.reviewCount =
            document.getElementById(
                "reviewCount"
            );

        this.elements.progressBar =
            document.getElementById(
                "examProgressBar"
            );

        this.elements.progressText =
            document.getElementById(
                "examProgressText"
            );

    }


    /*
    ======================================================
    ENGINE
    ======================================================
    */

    setEngine(engine) {

        this.engine = engine;

    }


    /*
    ======================================================
    RENDER COMPLETO
    ======================================================
    */

    render() {

        if (
            !this.engine ||
            !this.engine.getExam()
        ) {

            this.clear();

            return;

        }


        this.renderNavigation();

        this.renderCounters();

        this.renderProgress();

    }


    /*
    ======================================================
    NAVEGAÇÃO
    ======================================================
    */

    renderNavigation() {

        const container =
            this.elements.navigation;


        if (!container) {

            return;

        }


        const exam =
            this.engine.getExam();


        if (!exam) {

            container.innerHTML = "";

            return;

        }


        const questions =
            exam.getQuestions();


        const currentIndex =
            exam.getCurrentIndex();


        /*
        --------------------------------------------------
        Limpa navegação anterior
        --------------------------------------------------
        */

        container.innerHTML = "";


        /*
        --------------------------------------------------
        Cria botão para cada questão
        --------------------------------------------------
        */

        questions.forEach(
            (question, index) => {

                const button =
                    this.createNavigationButton(
                        question,
                        index,
                        currentIndex
                    );


                container.appendChild(
                    button
                );

            }
        );


        /*
        --------------------------------------------------
        Mantém questão atual visível
        --------------------------------------------------
        */

        window.requestAnimationFrame(
            () => {

                this.scrollCurrentIntoView();

            }
        );

    }


    /*
    ======================================================
    BOTÃO DA QUESTÃO
    ======================================================
    */

    createNavigationButton(
        question,
        index,
        currentIndex
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.type =
            "button";


        button.className =
            "question-nav-button";


        button.textContent =
            index + 1;


        button.dataset.index =
            String(index);


        button.setAttribute(
            "aria-label",
            `Question ${index + 1}`
        );


        /*
        --------------------------------------------------
        Questão atual
        --------------------------------------------------
        */

        if (
            index === currentIndex
        ) {

            button.classList.add(
                "current"
            );


            button.setAttribute(
                "aria-current",
                "true"
            );

        }


        /*
        --------------------------------------------------
        Respondida
        --------------------------------------------------
        */

        if (
            question.isAnswered()
        ) {

            button.classList.add(
                "answered"
            );

        } else {

            button.classList.add(
                "unanswered"
            );

        }


        /*
        --------------------------------------------------
        Revisão

        Review tem prioridade visual adicional,
        mas não remove o estado answered/unanswered.
        --------------------------------------------------
        */

        if (
            question.isMarkedForReview()
        ) {

            button.classList.add(
                "review"
            );

        }


        /*
        --------------------------------------------------
        Visitada
        --------------------------------------------------
        */

        if (
            question.wasVisited()
        ) {

            button.classList.add(
                "visited"
            );

        }


        /*
        --------------------------------------------------
        Tooltip
        --------------------------------------------------
        */

        button.title =
            this.buildButtonTitle(
                question,
                index
            );


        /*
        --------------------------------------------------
        Clique
        --------------------------------------------------
        */

        button.addEventListener(
            "click",
            () => {

                if (!this.engine) {

                    return;

                }


                this.engine
                    .goToQuestion(
                        index
                    );

            }
        );


        return button;

    }


    /*
    ======================================================
    TOOLTIP
    ======================================================
    */

    buildButtonTitle(
        question,
        index
    ) {

        const states = [];


        if (
            question.isAnswered()
        ) {

            states.push(
                "Answered"
            );

        } else {

            states.push(
                "Not answered"
            );

        }


        if (
            question.isMarkedForReview()
        ) {

            states.push(
                "Marked for review"
            );

        }


        return (
            `Question ${index + 1} — ` +
            states.join(", ")
        );

    }


    /*
    ======================================================
    CONTADORES
    ======================================================
    */

    renderCounters() {

        if (!this.engine) {

            return;

        }


        const exam =
            this.engine.getExam();


        if (!exam) {

            return;

        }


        const statistics =
            exam.getStatistics();


        /*
        --------------------------------------------------
        Questão atual
        --------------------------------------------------
        */

        if (
            this.elements.currentQuestion
        ) {

            this.elements
                .currentQuestion
                .textContent =
                exam.getCurrentIndex() + 1;

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
                statistics.answered;

        }


        /*
        --------------------------------------------------
        Não respondidas
        --------------------------------------------------
        */

        if (
            this.elements.unansweredCount
        ) {

            this.elements
                .unansweredCount
                .textContent =
                statistics.unanswered;

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
                statistics.review;

        }

    }


    /*
    ======================================================
    PROGRESSO
    ======================================================
    */

    renderProgress() {

        if (!this.engine) {

            return;

        }


        const exam =
            this.engine.getExam();


        if (!exam) {

            return;

        }


        const progress =
            exam.getProgressPercentage();


        /*
        --------------------------------------------------
        Barra
        --------------------------------------------------
        */

        if (
            this.elements.progressBar
        ) {

            this.elements
                .progressBar
                .style.width =
                `${progress}%`;


            this.elements
                .progressBar
                .setAttribute(
                    "aria-valuenow",
                    String(progress)
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
                `${progress}%`;

        }

    }


    /*
    ======================================================
    ATUALIZA SOMENTE ESTADOS DOS BOTÕES

    Evita reconstrução completa quando apenas uma
    resposta ou marcação de revisão mudou.
    ======================================================
    */

    updateStates() {

        if (
            !this.engine ||
            !this.engine.getExam()
        ) {

            return;

        }


        const exam =
            this.engine.getExam();


        const questions =
            exam.getQuestions();


        const currentIndex =
            exam.getCurrentIndex();


        const buttons =
            this.elements.navigation
                ?.querySelectorAll(
                    ".question-nav-button"
                );


        if (!buttons) {

            this.render();

            return;

        }


        /*
        Se quantidade de botões estiver incorreta,
        reconstrói navegação.
        */

        if (
            buttons.length !==
            questions.length
        ) {

            this.render();

            return;

        }


        buttons.forEach(
            (button, index) => {

                const question =
                    questions[index];


                /*
                Limpa estados
                */

                button.classList.remove(
                    "current",
                    "answered",
                    "unanswered",
                    "review",
                    "visited"
                );


                button.removeAttribute(
                    "aria-current"
                );


                /*
                Atual
                */

                if (
                    index === currentIndex
                ) {

                    button.classList.add(
                        "current"
                    );


                    button.setAttribute(
                        "aria-current",
                        "true"
                    );

                }


                /*
                Respondida
                */

                if (
                    question.isAnswered()
                ) {

                    button.classList.add(
                        "answered"
                    );

                } else {

                    button.classList.add(
                        "unanswered"
                    );

                }


                /*
                Revisão
                */

                if (
                    question
                        .isMarkedForReview()
                ) {

                    button.classList.add(
                        "review"
                    );

                }


                /*
                Visitada
                */

                if (
                    question.wasVisited()
                ) {

                    button.classList.add(
                        "visited"
                    );

                }


                /*
                Tooltip
                */

                button.title =
                    this.buildButtonTitle(
                        question,
                        index
                    );

            }
        );


        this.renderCounters();

        this.renderProgress();

        this.scrollCurrentIntoView();

    }


    /*
    ======================================================
    QUESTÃO ATUAL VISÍVEL
    ======================================================
    */

    scrollCurrentIntoView() {

        const container =
            this.elements.navigation;


        if (!container) {

            return;

        }


        const current =
            container.querySelector(
                ".question-nav-button.current"
            );


        if (!current) {

            return;

        }


        /*
        Evita mover a página inteira.
        Ajusta apenas o container quando necessário.
        */

        const containerRect =
            container
                .getBoundingClientRect();


        const currentRect =
            current
                .getBoundingClientRect();


        const outsideTop =
            currentRect.top <
            containerRect.top;


        const outsideBottom =
            currentRect.bottom >
            containerRect.bottom;


        const outsideLeft =
            currentRect.left <
            containerRect.left;


        const outsideRight =
            currentRect.right >
            containerRect.right;


        if (
            outsideTop ||
            outsideBottom ||
            outsideLeft ||
            outsideRight
        ) {

            current.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "nearest",

                inline:
                    "nearest"

            });

        }

    }


    /*
    ======================================================
    PRÓXIMA NÃO RESPONDIDA
    ======================================================
    */

    goToNextUnanswered() {

        if (
            !this.engine ||
            !this.engine.getExam()
        ) {

            return false;

        }


        const exam =
            this.engine.getExam();


        const questions =
            exam.getQuestions();


        const current =
            exam.getCurrentIndex();


        /*
        --------------------------------------------------
        Procura depois da questão atual
        --------------------------------------------------
        */

        for (
            let index =
                current + 1;

            index <
                questions.length;

            index++
        ) {

            if (
                !questions[index]
                    .isAnswered()
            ) {

                return this.engine
                    .goToQuestion(
                        index
                    );

            }

        }


        /*
        --------------------------------------------------
        Continua do início
        --------------------------------------------------
        */

        for (
            let index = 0;

            index < current;

            index++
        ) {

            if (
                !questions[index]
                    .isAnswered()
            ) {

                return this.engine
                    .goToQuestion(
                        index
                    );

            }

        }


        return false;

    }


    /*
    ======================================================
    PRÓXIMA MARCADA PARA REVISÃO
    ======================================================
    */

    goToNextReview() {

        if (
            !this.engine ||
            !this.engine.getExam()
        ) {

            return false;

        }


        const exam =
            this.engine.getExam();


        const questions =
            exam.getQuestions();


        const current =
            exam.getCurrentIndex();


        /*
        Depois da atual
        */

        for (
            let index =
                current + 1;

            index <
                questions.length;

            index++
        ) {

            if (
                questions[index]
                    .isMarkedForReview()
            ) {

                return this.engine
                    .goToQuestion(
                        index
                    );

            }

        }


        /*
        Início
        */

        for (
            let index = 0;

            index < current;

            index++
        ) {

            if (
                questions[index]
                    .isMarkedForReview()
            ) {

                return this.engine
                    .goToQuestion(
                        index
                    );

            }

        }


        return false;

    }


    /*
    ======================================================
    LIMPAR
    ======================================================
    */

    clear() {

        if (
            this.elements.navigation
        ) {

            this.elements
                .navigation
                .innerHTML = "";

        }


        if (
            this.elements.currentQuestion
        ) {

            this.elements
                .currentQuestion
                .textContent =
                "0";

        }


        if (
            this.elements.totalQuestions
        ) {

            this.elements
                .totalQuestions
                .textContent =
                "0";

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
            this.elements.unansweredCount
        ) {

            this.elements
                .unansweredCount
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
            this.elements.progressBar
        ) {

            this.elements
                .progressBar
                .style.width =
                "0%";

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

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.NavigationRenderer =
    NavigationRenderer;
