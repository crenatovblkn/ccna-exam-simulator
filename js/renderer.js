/**
 * ============================================================
 * renderer.js
 * ============================================================
 * CCNA Exam Simulator
 *
 * Responsabilidade:
 * Renderizar toda a interface da aplicação.
 *
 * Esta classe NÃO:
 *   - altera estado da prova
 *   - salva informações
 *   - responde eventos
 *   - controla navegação
 *   - controla timer
 *
 * Toda comunicação ocorre através do objeto App.
 * ============================================================
 */

class Renderer {

    /**
     * @param {App} app
     */
    constructor(app) {

        this.app = app;

        this.initialized = false;

        this.answerRenderers = new Map();

    }

    // =========================================================
    // Lifecycle
    // =========================================================

    initialize() {

        if (this.initialized) {
            return;
        }

        this.registerAnswerRenderers();

        this.initialized = true;

    }

    destroy() {

        this.answerRenderers.clear();

        this.initialized = false;

    }

    // =========================================================
    // Public API
    // =========================================================

    render() {

        if (!this.initialized) {
            return;
        }

        const engine = this.engine();

        if (!engine.hasQuestions()) {
            return;
        }

        if (engine.isFinished()) {

            this.renderResults();

            return;

        }

        this.renderQuestionArea();

        this.renderSidebar();

    }

    refresh() {

        this.render();

    }

    // =========================================================
    // Question Area
    // =========================================================

    renderQuestionArea() {

        this.renderQuestion();

        this.renderScenario();

        this.renderResources();

        this.renderAnswers();

    }

    renderQuestion() {

        const question = this.question();

        const ui = this.ui();

        if (!question) {

            ui.clear("question");

            return;

        }

        ui.setHTML(

            "question",

            question.getQuestion()

        );

    }

    renderScenario() {

        const scenario =

            this.question()

                .getScenario();

        if (!scenario) {

            this.clearScenario();

            return;

        }

        switch (scenario.type) {

            case "cli":

                this.renderCLIScenario(scenario);

                break;

            case "table":

                this.renderTableScenario(scenario);

                break;

            case "topology":

                this.renderTopologyScenario(scenario);

                break;

            case "packet-flow":

                this.renderPacketFlowScenario(scenario);

                break;

            case "lab":

                this.renderLabScenario(scenario);

                break;

            default:

                this.clearScenario();

        }

    }

    renderResources() {

        this.renderImage();

        this.renderExplanation();

    }

    renderImage() {

        const image =

            this.question()

                .getImage();

        const ui = this.ui();

        if (!image) {

            ui.hide("image");

            ui.clear("image");

            return;

        }

        ui.show("image");

        ui.setHTML(

            "image",

            `
            <img
                src="${image}"
                class="question-image"
                alt="Question Image">
            `

        );

    }

    renderExplanation() {

        const ui = this.ui();

        if (!this.engine().isFinished()) {

            this.hideExplanation();

            return;

        }

        const explanation =

            this.question()

                .getExplanation();

        if (!explanation) {

            this.hideExplanation();

            return;

        }

        ui.show(

            "explanation"

        );

        ui.setHTML(

            "explanation",

            explanation

        );

    }

    hideExplanation() {

        const ui = this.ui();

        ui.hide(

            "explanation"

        );

        ui.clear(

            "explanation"

        );

    }

    // =========================================================
    // Answers
    // =========================================================

    renderAnswers() {

        const question = this.question();

        const renderer =

            this.answerRenderers.get(

                question.getType()

            );

        if (!renderer) {

            this.clearAnswers();

            return;

        }

        renderer(question);

    }

    registerAnswerRenderers() {

        this.answerRenderers.set(

            "single",

            question => this.renderSingle(question)

        );

        this.answerRenderers.set(

            "multiple",

            question => this.renderMultiple(question)

        );

        this.answerRenderers.set(

            "dragdrop",

            question => this.renderDragDrop(question)

        );

        this.answerRenderers.set(

            "cli",

            question => this.renderCLI(question)

        );

        this.answerRenderers.set(

            "lab",

            question => this.renderLab(question)

        );

    }
	
	    renderSingle(question) {

        this.renderAnswerList(

            question,

            "radio"

        );

    }

    renderMultiple(question) {

        this.renderAnswerList(

            question,

            "checkbox"

        );

    }

    renderDragDrop(question) {

        const ui = this.ui();

        ui.setHTML(

            "answers",

            `
            <div class="question-placeholder">

                Drag & Drop não implementado.

            </div>
            `

        );

    }

    renderCLI(question) {

        this.renderAnswerList(

            question,

            "radio"

        );

    }

    renderLab(question) {

        this.renderAnswerList(

            question,

            "radio"

        );

    }

    renderAnswerList(question, inputType) {

        const html = question
            .getAnswers()
            .map(answer => this.renderAnswer(answer, inputType))
            .join("");

        this.ui().setHTML(

            "answers",

            html

        );

    }

    renderAnswer(answer, inputType) {

        const checked =

            answer.isSelected()

                ? "checked"

                : "";

        const selected =

            answer.isSelected()

                ? " selected"

                : "";

        return `

<label
    class="answer${selected}"
    data-answer-id="${answer.getId()}">

    <input
        type="${inputType}"
        ${checked}
        disabled>

    <span class="answer-letter">

        ${answer.getId()}

    </span>

    <span class="answer-text">

        ${answer.getText()}

    </span>

</label>

`;

    }

    clearAnswers() {

        this.ui().clear(

            "answers"

        );

    }

    // =========================================================
    // Sidebar
    // =========================================================

    renderSidebar() {

        this.renderProgress();

        this.renderNavigation();

        this.renderTimer();

        this.renderStatus();

    }

    renderProgress() {

        const progress =

            this.engine()

                .getProgress();

        const ui = this.ui();

        ui.setText(

            "progressText",

            `${progress.current} / ${progress.total}`

        );

        ui.setValue(

            "progressBar",

            progress.percent

        );

    }

    renderNavigation() {

        const engine = this.engine();

        const ui = this.ui();

        ui.setEnabled(

            "previousButton",

            engine.hasPrevious()

        );

        ui.setEnabled(

            "nextButton",

            engine.hasNext()

        );

        ui.setVisible(

            "finishButton",

            engine.isLastQuestion()

        );

        ui.toggleClass(

            "reviewButton",

            "active",

            engine.isCurrentQuestionMarkedForReview()

        );

        ui.setText(

            "questionCounter",

            `${engine.getCurrentQuestionNumber()} / ${engine.getTotalQuestions()}`

        );

    }

    renderTimer() {

        this.ui().setText(

            "timer",

            this.app.timer.getFormattedTime()

        );

    }

    renderStatus() {

        const engine = this.engine();

        const ui = this.ui();

        ui.setText(

            "answeredCount",

            engine.getAnsweredCount()

        );

        ui.setText(

            "remainingCount",

            engine.getRemainingCount()

        );

        ui.setText(

            "reviewCount",

            engine.getReviewCount()

        );

    }

    // =========================================================
    // Scenario Renderers
    // =========================================================

    renderCLIScenario(scenario) {

        this.renderScenarioHTML(

            `<pre class="cli-scenario">${scenario.content}</pre>`

        );

    }

    renderTableScenario(scenario) {

        this.renderScenarioHTML(

            scenario.content

        );

    }

    renderTopologyScenario(scenario) {

        this.renderScenarioHTML(

            scenario.content

        );

    }

    renderPacketFlowScenario(scenario) {

        this.renderScenarioHTML(

            scenario.content

        );

    }

    renderLabScenario(scenario) {

        this.renderScenarioHTML(

            scenario.content

        );

    }

    renderScenarioHTML(html) {

        const ui = this.ui();

        ui.show(

            "scenario"

        );

        ui.setHTML(

            "scenario",

            html

        );

    }

    clearScenario() {

        const ui = this.ui();

        ui.hide(

            "scenario"

        );

        ui.clear(

            "scenario"

        );

    }
	
	    // =========================================================
    // Results
    // =========================================================

    renderResults() {

        this.renderScore();

        this.renderStatistics();

        this.renderReviewSummary();

    }

    renderScore() {

        const results =

            this.engine()

                .getResults();

        const ui = this.ui();

        ui.setText(

            "resultCorrect",

            results.correct

        );

        ui.setText(

            "resultIncorrect",

            results.incorrect

        );

        ui.setText(

            "resultTotal",

            results.total

        );

        ui.setText(

            "resultPercentage",

            `${results.percentage}%`

        );

        ui.setText(

            "resultStatus",

            results.approved

                ? "APROVADO"

                : "REPROVADO"

        );

    }

    renderStatistics() {

        const progress =

            this.engine()

                .getProgress();

        const ui = this.ui();

        ui.setText(

            "statisticsAnswered",

            progress.answered

        );

        ui.setText(

            "statisticsRemaining",

            progress.remaining

        );

        ui.setText(

            "statisticsReview",

            this.engine()

                .getReviewCount()

        );

        ui.setText(

            "statisticsTime",

            this.app.timer

                .getFormattedTime()

        );

    }

    renderReviewSummary() {

        const ui = this.ui();

        ui.setText(

            "reviewQuestions",

            this.engine()

                .getReviewCount()

        );

    }

    // =========================================================
    // Helpers
    // =========================================================

    engine() {

        return this.app.examEngine;

    }

    ui() {

        return this.app.ui;

    }

    timer() {

        return this.app.timer;

    }

    question() {

        return this.engine()

            .getCurrentQuestion();

    }

    hasQuestion() {

        return this.question() !== null;

    }

    isFinished() {

        return this.engine()

            .isFinished();

    }

    isInitialized() {

        return this.initialized;

    }

}