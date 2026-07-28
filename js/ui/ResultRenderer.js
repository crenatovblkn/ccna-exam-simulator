/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
ResultRenderer

Responsabilidade:
- Renderizar o resultado final
- Mostrar score
- Mostrar acertos e erros
- Mostrar questões não respondidas
- Mostrar desempenho por domínio
- Mostrar tempo utilizado
- Mostrar status de aprovação
- Exibir revisão detalhada das questões
- Controlar abertura e fechamento do resultado

Este componente NÃO calcula o resultado.
==========================================================
*/

class ResultRenderer {

    constructor(options = {}) {

        this.engine =
            options.engine || null;

        this.container =
            options.container || null;

        this.result =
            null;

        this.onClose =
            typeof options.onClose === "function"
                ? options.onClose
                : null;

        this.onRestart =
            typeof options.onRestart === "function"
                ? options.onRestart
                : null;

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
    CONTAINER
    ======================================================
    */

    setContainer(container) {

        this.container = container;

    }


    /*
    ======================================================
    CALLBACKS
    ======================================================
    */

    setOnClose(callback) {

        this.onClose =
            typeof callback === "function"
                ? callback
                : null;

    }


    setOnRestart(callback) {

        this.onRestart =
            typeof callback === "function"
                ? callback
                : null;

    }


    /*
    ======================================================
    RENDER
    ======================================================
    */

    render(result = null) {

        if (!result && this.engine) {

    if (
        typeof this.engine.getResult ===
        "function"
    ) {

        result =
            this.engine.getResult();

    }

}

        if (!result) {

            return false;

        }


        this.result = result;


        if (!this.container) {

            this.container =
                document.getElementById(
                    "resultScreen"
                );

        }


        if (!this.container) {

            console.error(
                "Result screen container was not found."
            );

            return false;

        }


        this.container.innerHTML = "";


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "result-wrapper";


        /*
        --------------------------------------------------
        Cabeçalho
        --------------------------------------------------
        */

        wrapper.appendChild(
            this.createHeader(result)
        );


        /*
        --------------------------------------------------
        Score
        --------------------------------------------------
        */

        wrapper.appendChild(
            this.createScoreSection(
                result
            )
        );


        /*
        --------------------------------------------------
        Estatísticas
        --------------------------------------------------
        */

        wrapper.appendChild(
            this.createStatisticsSection(
                result
            )
        );


        /*
        --------------------------------------------------
        Domínios
        --------------------------------------------------
        */

        const domainSection =
            this.createDomainSection(
                result
            );


        if (domainSection) {

            wrapper.appendChild(
                domainSection
            );

        }


        /*
        --------------------------------------------------
        Revisão
        --------------------------------------------------
        */

        const reviewSection =
            this.createReviewSection(
                result
            );


        if (reviewSection) {

            wrapper.appendChild(
                reviewSection
            );

        }


        /*
        --------------------------------------------------
        Ações
        --------------------------------------------------
        */

        wrapper.appendChild(
            this.createActions()
        );


        this.container.appendChild(
            wrapper
        );


        this.show();


        return true;

    }


    /*
    ======================================================
    CABEÇALHO
    ======================================================
    */

    createHeader(result) {

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "result-header";


        const eyebrow =
            document.createElement(
                "div"
            );


        eyebrow.className =
            "result-eyebrow";

        eyebrow.textContent =
            "EXAM COMPLETE";


        const title =
            document.createElement(
                "h1"
            );


        title.textContent =
            result.title ||
            "Cisco CCNA 200-301";


        const subtitle =
            document.createElement(
                "p"
            );


        subtitle.textContent =
            result.domain ||
            "Exam Results";


        header.appendChild(
            eyebrow
        );

        header.appendChild(
            title
        );

        header.appendChild(
            subtitle
        );


        return header;

    }


    /*
    ======================================================
    SCORE
    ======================================================
    */

    createScoreSection(result) {

        const section =
            document.createElement(
                "section"
            );


        section.className =
            "result-score-section";


        const score =
            Number(result.score) || 0;


        const passingScore =
            Number.isFinite(
                Number(result.passingScore)
            )
                ? Number(
                    result.passingScore
                )
                : 70;


        const passed =
            typeof result.passed ===
            "boolean"
                ? result.passed
                : score >= passingScore;


        /*
        --------------------------------------------------
        Círculo / bloco de score
        --------------------------------------------------
        */

        const scoreBlock =
            document.createElement(
                "div"
            );


        scoreBlock.className =
            "result-score-block";


        scoreBlock.classList.add(
            passed
                ? "passed"
                : "failed"
        );


        const scoreValue =
            document.createElement(
                "div"
            );


        scoreValue.className =
            "result-score-value";

        scoreValue.textContent =
            `${score}%`;


        const scoreLabel =
            document.createElement(
                "div"
            );


        scoreLabel.className =
            "result-score-label";

        scoreLabel.textContent =
            "Score";


        scoreBlock.appendChild(
            scoreValue
        );

        scoreBlock.appendChild(
            scoreLabel
        );


        /*
        --------------------------------------------------
        Status
        --------------------------------------------------
        */

        const status =
            document.createElement(
                "div"
            );


        status.className =
            "result-status";


        const statusTitle =
            document.createElement(
                "h2"
            );


        statusTitle.textContent =
            passed
                ? "PASSED"
                : "NOT PASSED";


        const statusText =
            document.createElement(
                "p"
            );


        statusText.textContent =
            passed
                ? "You reached the simulator passing score."
                : "You did not reach the simulator passing score.";


        const threshold =
            document.createElement(
                "span"
            );


        threshold.className =
            "result-threshold";

        threshold.textContent =
            `Simulator passing score: ${passingScore}%`;


        status.appendChild(
            statusTitle
        );

        status.appendChild(
            statusText
        );

        status.appendChild(
            threshold
        );


        section.appendChild(
            scoreBlock
        );

        section.appendChild(
            status
        );


        return section;

    }


    /*
    ======================================================
    ESTATÍSTICAS
    ======================================================
    */

    createStatisticsSection(
        result
    ) {

        const section =
            document.createElement(
                "section"
            );


        section.className =
            "result-statistics";


        const cards =
            [

                {
                    label:
                        "Questions",

                    value:
                        result.totalQuestions ??
                        0,

                    className:
                        "total"
                },

                {
                    label:
                        "Correct",

                    value:
                        result.correct ??
                        0,

                    className:
                        "correct"
                },

                {
                    label:
                        "Incorrect",

                    value:
                        result.incorrect ??
                        0,

                    className:
                        "incorrect"
                },

                {
                    label:
                        "Unanswered",

                    value:
                        result.unanswered ??
                        0,

                    className:
                        "unanswered"
                },

                {
                    label:
                        "Review",

                    value:
                        result.review ??
                        0,

                    className:
                        "review"
                },

                {
                    label:
                        "Time",

                    value:
                        result.formattedElapsedTime ||
                        this.formatTime(
                            result.elapsedTime
                        ),

                    className:
                        "time"
                }

            ];


        cards.forEach(
            item => {

                section.appendChild(
                    this.createStatisticCard(
                        item
                    )
                );

            }
        );


        return section;

    }


    /*
    ======================================================
    CARD ESTATÍSTICO
    ======================================================
    */

    createStatisticCard(item) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            `result-stat-card ${item.className || ""}`;


        const value =
            document.createElement(
                "strong"
            );


        value.textContent =
            item.value;


        const label =
            document.createElement(
                "span"
            );


        label.textContent =
            item.label;


        card.appendChild(
            value
        );

        card.appendChild(
            label
        );


        return card;

    }


    /*
    ======================================================
    DESEMPENHO POR DOMÍNIO
    ======================================================
    */

    createDomainSection(result) {

        if (
            !result.domains ||
            typeof result.domains !==
            "object"
        ) {

            return null;

        }


        const domains =
            Object.values(
                result.domains
            );


        if (
            domains.length === 0
        ) {

            return null;

        }


        const section =
            document.createElement(
                "section"
            );


        section.className =
            "result-domain-section";


        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            "Performance by Domain";


        section.appendChild(
            title
        );


        const list =
            document.createElement(
                "div"
            );


        list.className =
            "result-domain-list";


        domains.forEach(
            domain => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "result-domain-item";


                /*
                Cabeçalho
                */

                const header =
                    document.createElement(
                        "div"
                    );


                header.className =
                    "result-domain-header";


                const name =
                    document.createElement(
                        "strong"
                    );


                name.textContent =
                    domain.domain ||
                    "Unknown";


                const percentage =
                    document.createElement(
                        "span"
                    );


                percentage.textContent =
                    `${domain.percentage || 0}%`;


                header.appendChild(
                    name
                );

                header.appendChild(
                    percentage
                );


                /*
                Barra
                */

                const progress =
                    document.createElement(
                        "div"
                    );


                progress.className =
                    "result-domain-progress";


                const bar =
                    document.createElement(
                        "div"
                    );


                bar.className =
                    "result-domain-progress-bar";


                const percent =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            Number(
                                domain.percentage
                            ) || 0
                        )
                    );


                bar.style.width =
                    `${percent}%`;


                progress.appendChild(
                    bar
                );


                /*
                Detalhes
                */

                const details =
                    document.createElement(
                        "div"
                    );


                details.className =
                    "result-domain-details";


                details.textContent =
                    `${domain.correct || 0} correct · ` +
                    `${domain.incorrect || 0} incorrect · ` +
                    `${domain.unanswered || 0} unanswered`;


                item.appendChild(
                    header
                );

                item.appendChild(
                    progress
                );

                item.appendChild(
                    details
                );


                list.appendChild(
                    item
                );

            }
        );


        section.appendChild(
            list
        );


        return section;

    }


    /*
    ======================================================
    REVISÃO DAS QUESTÕES
    ======================================================
    */

    createReviewSection(result) {

        if (
            !Array.isArray(
                result.questions
            ) ||
            result.questions.length === 0
        ) {

            return null;

        }


        const section =
            document.createElement(
                "section"
            );


        section.className =
            "result-review-section";


        /*
        --------------------------------------------------
        Header
        --------------------------------------------------
        */

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "result-review-header";


        const title =
            document.createElement(
                "h2"
            );


        title.textContent =
            "Question Review";


        const toggle =
            document.createElement(
                "button"
            );


        toggle.type =
            "button";

        toggle.className =
            "btn btn-secondary result-review-toggle";

        toggle.textContent =
            "Show Review";


        header.appendChild(
            title
        );

        header.appendChild(
            toggle
        );


        section.appendChild(
            header
        );


        /*
        --------------------------------------------------
        Lista
        --------------------------------------------------
        */

        const list =
            document.createElement(
                "div"
            );


        list.className =
            "result-review-list hidden";


        result.questions.forEach(
            question => {

                list.appendChild(
                    this.createQuestionReview(
                        question
                    )
                );

            }
        );


        section.appendChild(
            list
        );


        /*
        --------------------------------------------------
        Toggle
        --------------------------------------------------
        */

        toggle.addEventListener(
            "click",
            () => {

                const hidden =
                    list.classList
                        .contains(
                            "hidden"
                        );


                if (hidden) {

                    list.classList.remove(
                        "hidden"
                    );

                    toggle.textContent =
                        "Hide Review";

                } else {

                    list.classList.add(
                        "hidden"
                    );

                    toggle.textContent =
                        "Show Review";

                }

            }
        );


        return section;

    }


    /*
    ======================================================
    REVISÃO INDIVIDUAL
    ======================================================
    */

    createQuestionReview(question) {

        const item =
            document.createElement(
                "article"
            );


        item.className =
            "result-question-review";


        if (
            !question.answered
        ) {

            item.classList.add(
                "unanswered"
            );

        } else if (
            question.correct
        ) {

            item.classList.add(
                "correct"
            );

        } else {

            item.classList.add(
                "incorrect"
            );

        }


        /*
        --------------------------------------------------
        Cabeçalho
        --------------------------------------------------
        */

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "result-question-header";


        const number =
            document.createElement(
                "strong"
            );


        number.textContent =
            `Question ${question.number}`;


        const status =
            document.createElement(
                "span"
            );


        status.className =
            "result-question-status";


        if (
            !question.answered
        ) {

            status.textContent =
                "Unanswered";

        } else if (
            question.correct
        ) {

            status.textContent =
                "Correct";

        } else {

            status.textContent =
                "Incorrect";

        }


        header.appendChild(
            number
        );

        header.appendChild(
            status
        );


        /*
        --------------------------------------------------
        Enunciado
        --------------------------------------------------
        */

        const text =
            document.createElement(
                "div"
            );


        text.className =
            "result-question-text";


        text.innerHTML =
            this.formatText(
                question.question
            );


        /*
        --------------------------------------------------
        Respostas
        --------------------------------------------------
        */

        const answers =
            document.createElement(
                "div"
            );


        answers.className =
            "result-question-answers";


        const userAnswer =
            document.createElement(
                "div"
            );


        userAnswer.innerHTML =
            `<strong>Your answer:</strong> ${
                this.formatAnswerIds(
                    question.userAnswers
                )
            }`;


        const correctAnswer =
            document.createElement(
                "div"
            );


        correctAnswer.innerHTML =
            `<strong>Correct answer:</strong> ${
                this.formatAnswerIds(
                    question.correctAnswers
                )
            }`;


        answers.appendChild(
            userAnswer
        );

        answers.appendChild(
            correctAnswer
        );


        /*
        --------------------------------------------------
        Explicação
        --------------------------------------------------
        */

        let explanation =
            null;


        if (
            question.explanation
        ) {

            explanation =
                document.createElement(
                    "div"
                );


            explanation.className =
                "result-question-explanation";


            const explanationTitle =
                document.createElement(
                    "strong"
                );


            explanationTitle.textContent =
                "Explanation";


            const explanationText =
                document.createElement(
                    "p"
                );


            explanationText.innerHTML =
                this.formatText(
                    question.explanation
                );


            explanation.appendChild(
                explanationTitle
            );

            explanation.appendChild(
                explanationText
            );

        }


        item.appendChild(
            header
        );

        item.appendChild(
            text
        );

        item.appendChild(
            answers
        );


        if (explanation) {

            item.appendChild(
                explanation
            );

        }


        return item;

    }


    /*
    ======================================================
    AÇÕES
    ======================================================
    */

    createActions() {

        const actions =
            document.createElement(
                "div"
            );


        actions.className =
            "result-actions";


        /*
        --------------------------------------------------
        Novo exame
        --------------------------------------------------
        */

        const restartButton =
            document.createElement(
                "button"
            );


        restartButton.type =
            "button";

        restartButton.className =
            "btn btn-primary";

        restartButton.textContent =
            "NEW EXAM";


        restartButton.addEventListener(
            "click",
            () => {

                this.hide();


                if (
                    this.onRestart
                ) {

                    this.onRestart(
                        this.result
                    );

                }

            }
        );


        /*
        --------------------------------------------------
        Fechar
        --------------------------------------------------
        */

        const closeButton =
            document.createElement(
                "button"
            );


        closeButton.type =
            "button";

        closeButton.className =
            "btn btn-secondary";

        closeButton.textContent =
            "CLOSE";


        closeButton.addEventListener(
            "click",
            () => {

                this.hide();


                if (
                    this.onClose
                ) {

                    this.onClose(
                        this.result
                    );

                }

            }
        );


        actions.appendChild(
            restartButton
        );

        actions.appendChild(
            closeButton
        );


        return actions;

    }


    /*
    ======================================================
    MOSTRAR
    ======================================================
    */

    show() {

        if (!this.container) {

            return;

        }


        this.container.classList.remove(
            "hidden"
        );


        this.container.classList.add(
            "active"
        );


        document.body.classList.add(
            "result-open"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /*
    ======================================================
    ESCONDER
    ======================================================
    */

    hide() {

        if (!this.container) {

            return;

        }


        this.container.classList.remove(
            "active"
        );


        this.container.classList.add(
            "hidden"
        );


        document.body.classList.remove(
            "result-open"
        );

    }


    /*
    ======================================================
    LIMPAR
    ======================================================
    */

    clear() {

        this.result = null;


        if (this.container) {

            this.container.innerHTML =
                "";

        }


        this.hide();

    }


    /*
    ======================================================
    FORMATAR IDS DE RESPOSTA
    ======================================================
    */

    formatAnswerIds(
        answers
    ) {

        if (
            !Array.isArray(answers) ||
            answers.length === 0
        ) {

            return "No answer";

        }


        return answers
            .map(
                answer =>
                    this.escapeHTML(
                        String(answer)
                    )
            )
            .join(", ");

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


        if (hours > 0) {

            return (
                String(hours)
                    .padStart(2, "0") +
                ":" +
                String(minutes)
                    .padStart(2, "0") +
                ":" +
                String(
                    remainingSeconds
                ).padStart(2, "0")
            );

        }


        return (
            String(minutes)
                .padStart(2, "0") +
            ":" +
            String(
                remainingSeconds
            ).padStart(2, "0")
        );

    }


    /*
    ======================================================
    FORMATAÇÃO
    ======================================================
    */

    formatText(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }


        return this.escapeHTML(
            String(value)
        )
            .replace(
                /\n/g,
                "<br>"
            )
            .replace(
                /`([^`]+)`/g,
                "<code>$1</code>"
            );

    }


    /*
    ======================================================
    ESCAPE HTML
    ======================================================
    */

    escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.ResultRenderer =
    ResultRenderer;
