/*
==========================================================
CCNA Exam Simulator
Navigation Controller
==========================================================

Responsabilidades

• Registrar eventos da interface
• Controlar navegação
• Coordenar atualização da aplicação
• Solicitar renderização
• Persistir estado

O NavigationController NÃO conhece:

• HTML
• CSS
• Questões
• Score

Toda lógica da prova pertence ao ExamEngine.

==========================================================
*/

class NavigationController {

    constructor(app) {

        if (!app) {
            throw new Error("App instance is required.");
        }

        this.app = app;

        this._initialized = false;

    }

    /*
    ======================================================
    Inicialização
    ======================================================
    */

    initialize() {

        if (this._initialized) {
            return;
        }

        this.bindEvents();

        this.refresh();

        this._initialized = true;

    }

    /*
    ======================================================
    Eventos
    ======================================================
    */

    bindEvents() {

        const ui = this.app.ui;

        const events = [

            ["nextButton", "click", this.next],
            ["previousButton", "click", this.previous],
            ["finishButton", "click", this.finish],
            ["reviewButton", "click", this.toggleReview]

        ];

        events.forEach(

            ([id, event, handler]) =>

                ui.bindEvent(

                    id,

                    event,

                    handler.bind(this)

                )

        );

    }

    /*
    ======================================================
    Navegação
    ======================================================
    */

    next() {

        if (this.app.examEngine.next()) {

            this.refresh();

        }

    }

    previous() {

        if (this.app.examEngine.previous()) {

            this.refresh();

        }

    }

    goTo(index) {

        if (this.app.examEngine.goTo(index)) {

            this.refresh();

        }

    }

    /*
    ======================================================
    Revisão
    ======================================================
    */

    toggleReview() {

        this.app.examEngine.toggleReview();

        this.refresh();

    }

    /*
    ======================================================
    Finalização
    ======================================================
    */

    finish() {

        if (!this.app.examEngine.finish()) {
            return;
        }

        this.app.storage.remove();

        // Futuramente:
        // this.app.renderer.renderResults();

        this.refresh();

    }

    /*
    ======================================================
    Persistência
    ======================================================
    */

    save() {

        this.app.storage.save();

    }

    restore() {

        if (this.app.storage.restore()) {

            this.refresh();

        }

    }

    /*
    ======================================================
    Atualização
    ======================================================
    */

    refresh() {

        this.render();

        this.updateNavigation();

        this.save();

    }

    /*
    ======================================================
    Renderização
    ======================================================
    */

    render() {

        this.app.renderer.renderCurrentQuestion();

    }

    /*
    ======================================================
    Navegação Visual
    ======================================================
    */

    updateNavigation() {

        const engine = this.app.examEngine;

        const ui = this.app.ui;

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

    }

    /*
    ======================================================
    Destruição
    ======================================================
    */

    destroy() {

        this._initialized = false;

    }

}