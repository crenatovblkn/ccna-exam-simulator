/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
ResultRenderer

Responsabilidade
----------------------------------------------------------
- Receber o resultado calculado pelo ExamEngine
- Atualizar a tela de resultados existente no HTML
- Exibir desempenho por domínio
- Exibir revisão das questões
==========================================================
*/

class ResultRenderer {

    constructor(options = {}) {

        this.engine =
            options.engine || null;

        this.container =
            options.container ||
            document.getElementById(
                "resultsScreen"
            );

        this.result = null;

        this.onClose =
            typeof options.onClose === "function"
                ? options.onClose
                : null;

        this.onRestart =
            typeof options.onRestart === "function"
                ? options.onRestart
                : null;

        this.cacheElements();

        this.bindButtons();

    }

    /*
    ======================================================
    ELEMENTOS
    ======================================================
    */

    cacheElements() {

        this.elements = {

            percentage:
                document.getElementById(
                    "resultPercentage"
                ),

            status:
                document.getElementById(
                    "resultStatus"
                ),

            correct:
                document.getElementById(
                    "resultCorrect"
                ),

            incorrect:
                document.getElementById(
                    "resultIncorrect"
                ),

            unanswered:
                document.getElementById(
                    "resultUnanswered"
                ),

            total:
                document.getElementById(
                    "resultTotal"
                ),

            time:
                document.getElementById(
                    "resultTime"
                ),

            domains:
                document.getElementById(
                    "domainResults"
                ),

            questions:
                document.getElementById(
                    "resultsQuestionList"
                ),

            reviewButton:
                document.getElementById(
                    "reviewExamButton"
                ),

            restartButton:
                document.getElementById(
                    "restartExamButton"
                )

        };

    }

    /*
    ======================================================
    BOTÕES
    ======================================================
    */

    bindButtons() {

        if (this.elements.reviewButton) {

            this.elements.reviewButton
                .addEventListener(
                    "click",
                    () => {

                        if (this.onClose) {

                            this.onClose(
                                this.result
                            );

                        }

                    }
                );

        }

        if (this.elements.restartButton) {

            this.elements.restartButton
                .addEventListener(
                    "click",
                    () => {

                        if (this.onRestart) {

                            this.onRestart(
                                this.result
                            );

                        }

                    }
                );

        }

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

        this.updateSummary(result);

        this.updateDomains(result);

        this.updateQuestionReview(result);

        this.show();

        return true;

    }

    /*
    ======================================================
    RESUMO
    ======================================================
    */

    updateSummary(result) {

        if (this.elements.percentage) {

            this.elements.percentage.textContent =
                `${Number(result.score) || 0}%`;

        }

        if (this.elements.status) {

            const passed =
                typeof result.passed === "boolean"
                    ? result.passed
                    : (Number(result.score) || 0) >=
                      (Number(result.passingScore) || 70);

            this.elements.status.textContent =
                passed
                    ? "APROVADO"
                    : "NÃO APROVADO";

            this.elements.status.classList.remove(
                "passed",
                "failed"
            );

            this.elements.status.classList.add(
                passed
                    ? "passed"
                    : "failed"
            );

        }

        if (this.elements.correct) {

            this.elements.correct.textContent =
                result.correct ?? 0;

        }

        if (this.elements.incorrect) {

            this.elements.incorrect.textContent =
                result.incorrect ?? 0;

        }

        if (this.elements.unanswered) {

            this.elements.unanswered.textContent =
                result.unanswered ?? 0;

        }

        if (this.elements.total) {

            this.elements.total.textContent =
                result.totalQuestions ?? 0;

        }

        if (this.elements.time) {

            this.elements.time.textContent =
                result.formattedElapsedTime ||
                this.formatTime(
                    result.elapsedTime
                );

        }

    }

    /*
    ======================================================
    DOMÍNIOS
    ======================================================
    */

    updateDomains(result) {

        if (!this.elements.domains) {

            return;

        }

        this.elements.domains.innerHTML = "";

        if (
            !result.domains ||
            typeof result.domains !== "object"
        ) {

            return;

        }

        Object.values(result.domains)
            .forEach(domain => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "domain-result-card";


                /*
                --------------------------------------------
                Cabeçalho
                --------------------------------------------
                */

                const header =
                    document.createElement(
                        "div"
                    );

                header.className =
                    "domain-result-header";


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
                --------------------------------------------
                Barra
                --------------------------------------------
                */

                const progress =
                    document.createElement(
                        "div"
                    );

                progress.className =
                    "domain-progress";


                const bar =
                    document.createElement(
                        "div"
                    );

                bar.className =
                    "domain-progress-bar";

                bar.style.width =
                    `${Math.max(
                        0,
                        Math.min(
                            100,
                            Number(
                                domain.percentage
                            ) || 0
                        )
                    )}%`;

                progress.appendChild(
                    bar
                );


                /*
                --------------------------------------------
                Estatísticas
                --------------------------------------------
                */

                const details =
                    document.createElement(
                        "div"
                    );

                details.className =
                    "domain-result-details";

                details.innerHTML =

                    `<span>✔ ${domain.correct || 0}</span>
                     <span>✖ ${domain.incorrect || 0}</span>
                     <span>— ${domain.unanswered || 0}</span>`;


                card.appendChild(
                    header
                );

                card.appendChild(
                    progress
                );

                card.appendChild(
                    details
                );

                this.elements.domains
                    .appendChild(
                        card
                    );

            });

    }

    /*
    ======================================================
    REVISÃO DAS QUESTÕES
    ======================================================
    */

    updateQuestionReview(result) {

        if (!this.elements.questions) {
            return;
        }

        this.elements.questions.innerHTML = "";

        if (
            !Array.isArray(result.questions) ||
            result.questions.length === 0
        ) {
            return;
        }

        result.questions.forEach((question, index) => {

            const card = document.createElement("div");
            card.className = "result-question-card";


            /*
            ------------------------------------------------
            Cabeçalho
            ------------------------------------------------
            */

            const header = document.createElement("div");
            header.className = "result-question-header";

            const title = document.createElement("h3");
            title.textContent =
                `Questão ${index + 1}`;

            const status = document.createElement("span");

            if (question.isCorrect) {

                status.className =
                    "question-status correct";

                status.textContent =
                    "✔ Correta";

            } else if (
                question.selectedAnswer === null ||
                question.selectedAnswer === undefined
            ) {

                status.className =
                    "question-status unanswered";

                status.textContent =
                    "— Não respondida";

            } else {

                status.className =
                    "question-status incorrect";

                status.textContent =
                    "✖ Incorreta";

            }

            header.appendChild(title);
            header.appendChild(status);


            /*
            ------------------------------------------------
            Pergunta
            ------------------------------------------------
            */

            const statement =
                document.createElement("div");

            statement.className =
                "result-question-text";

            statement.innerHTML =
                this.escapeHTML(
                    question.question ||
                    question.text ||
                    ""
                );


            /*
            ------------------------------------------------
            Lista de respostas
            ------------------------------------------------
            */

            const answers =
                document.createElement("ul");

            answers.className =
                "result-answer-list";


            const options =
                question.options ||
                question.answers ||
                [];


            options.forEach((option, optionIndex) => {

                const item =
                    document.createElement("li");

                item.className =
                    "result-answer-item";

                const isCorrect =
                    optionIndex ===
                    question.correctAnswer;

                const isSelected =
                    optionIndex ===
                    question.selectedAnswer;


                if (isCorrect) {
                    item.classList.add(
                        "correct"
                    );
                }

                if (isSelected) {
                    item.classList.add(
                        "selected"
                    );
                }

                if (
                    isSelected &&
                    !isCorrect
                ) {
                    item.classList.add(
                        "incorrect"
                    );
                }


                const marker =
                    document.createElement("span");

                marker.className =
                    "answer-marker";


                if (isCorrect) {

                    marker.textContent =
                        "✔";

                } else if (
                    isSelected
                ) {

                    marker.textContent =
                        "➜";

                } else {

                    marker.textContent =
                        "";

                }


                const text =
                    document.createElement("span");

                text.className =
                    "answer-text";

                text.innerHTML =
                    this.escapeHTML(option);


                item.appendChild(marker);
                item.appendChild(text);

                answers.appendChild(item);

            });


            /*
            ------------------------------------------------
            Explicação
            ------------------------------------------------
            */

            if (
                question.explanation &&
                question.explanation.trim() !== ""
            ) {

                const explanation =
                    document.createElement("div");

                explanation.className =
                    "result-explanation";

                explanation.innerHTML =

                    "<strong>Explicação</strong><br>" +
                    this.escapeHTML(
                        question.explanation
                    );

                card.appendChild(
                    explanation
                );

            }


            /*
            ------------------------------------------------
            Montagem
            ------------------------------------------------
            */

            card.appendChild(header);

            card.appendChild(statement);

            card.appendChild(answers);

            this.elements.questions.appendChild(
                card
            );

        });

    }

    /*
    ======================================================
    EXIBIÇÃO
    ======================================================
    */

    show() {

        if (!this.container) {
            return;
        }

        this.container.classList.remove("hidden");

        this.container.style.display = "";

        this.container.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    /*
    ======================================================
    OCULTAR
    ======================================================
    */

    hide() {

        if (!this.container) {
            return;
        }

        this.container.classList.add("hidden");

    }

    /*
    ======================================================
    LIMPAR
    ======================================================
    */

    clear() {

        this.result = null;

        if (this.elements.percentage) {
            this.elements.percentage.textContent = "0%";
        }

        if (this.elements.status) {

            this.elements.status.textContent = "";

            this.elements.status.classList.remove(
                "passed",
                "failed"
            );

        }

        if (this.elements.correct) {
            this.elements.correct.textContent = "0";
        }

        if (this.elements.incorrect) {
            this.elements.incorrect.textContent = "0";
        }

        if (this.elements.unanswered) {
            this.elements.unanswered.textContent = "0";
        }

        if (this.elements.total) {
            this.elements.total.textContent = "0";
        }

        if (this.elements.time) {
            this.elements.time.textContent = "00:00";
        }

        if (this.elements.domains) {
            this.elements.domains.innerHTML = "";
        }

        if (this.elements.questions) {
            this.elements.questions.innerHTML = "";
        }

    }

    /*
    ======================================================
    CALLBACKS
    ======================================================
    */

    setOnClose(callback) {

        if (typeof callback === "function") {
            this.onClose = callback;
        }

    }

    setOnRestart(callback) {

        if (typeof callback === "function") {
            this.onRestart = callback;
        }

    }

    /*
    ======================================================
    UTILITÁRIOS
    ======================================================
    */

    formatTime(seconds) {

        seconds = Number(seconds);

        if (!Number.isFinite(seconds) || seconds < 0) {
            seconds = 0;
        }

        const hours = Math.floor(seconds / 3600);

        const minutes = Math.floor(
            (seconds % 3600) / 60
        );

        const secs = Math.floor(
            seconds % 60
        );

        if (hours > 0) {

            return (
                String(hours).padStart(2, "0") +
                ":" +
                String(minutes).padStart(2, "0") +
                ":" +
                String(secs).padStart(2, "0")
            );

        }

        return (
            String(minutes).padStart(2, "0") +
            ":" +
            String(secs).padStart(2, "0")
        );

    }

    formatText(text) {

        if (
            text === null ||
            text === undefined
        ) {

            return "";

        }

        return String(text).trim();

    }

    escapeHTML(text) {

        if (
            text === null ||
            text === undefined
        ) {

            return "";

        }

        return String(text)

            .replace(/&/g, "&amp;")

            .replace(/</g, "&lt;")

            .replace(/>/g, "&gt;")

            .replace(/"/g, "&quot;")

            .replace(/'/g, "&#39;");

    }

}
