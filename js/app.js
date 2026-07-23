/*
==========================================================
CCNA Exam Simulator
Application
==========================================================

Responsabilidades

• Criar todos os módulos
• Inicializar a aplicação
• Carregar o banco de questões
• Criar o exame
• Restaurar estado salvo
• Encerrar a aplicação

==========================================================
*/

class App {

    constructor() {

        this.modules = {};

        this.questionManager = null;
        this.examEngine = null;
        this.storage = null;
        this.timer = null;
        this.ui = null;
        this.navigation = null;
        this.renderer = null;

        this.initialized = false;

    }

    /*
    ======================================================
    Inicialização
    ======================================================
    */

    async initialize() {

        if (this.initialized) {
            return;
        }

        this.createModules();

        this.ui.initialize();

        await this.loadQuestions();

        this.createExam();

        this.restoreState();

        this.navigation.initialize();
        this.renderer.initialize();
        this.renderer.render();
        this.ui.hide("loading");
        this.initialized = true;

    }

    /*
    ======================================================
    Criação dos módulos
    ======================================================
    */

    createModules() {

        this.questionManager = new QuestionManager(this);
        this.examEngine = new ExamEngine(this);
        this.storage = new StorageManager(this);
        this.timer = new Timer(this);
        this.ui = new UIManager(this);
        this.navigation = new NavigationController(this);
        this.renderer = new Renderer(this);

        this.modules = {

            questionManager: this.questionManager,
            examEngine: this.examEngine,
            storage: this.storage,
            timer: this.timer,
            ui: this.ui,
            navigation: this.navigation,
            renderer: this.renderer

        };

    }

    /*
    ======================================================
    Carregar Banco de Questões
    ======================================================
    */

    async loadQuestions() {

        await this.questionManager.load();

    }

    /*
    ======================================================
    Criar Exame
    ======================================================
    */

    createExam() {

        const exam = this.questionManager.buildExam();

        this.examEngine.initialize(exam);

    }

    /*
    ======================================================
    Restaurar Estado
    ======================================================
    */

    restoreState() {

        if (!this.storage.exists()) {
            return;
        }

        this.storage.restore();

    }

    /*
    ======================================================
    Encerrar Aplicação
    ======================================================
    */

    destroy() {

        Object.values(this.modules).forEach(module => {

            if (typeof module.destroy === "function") {
                module.destroy();
            }

        });

        this.initialized = false;

    }

}

/*
==========================================================
Bootstrap
==========================================================
*/

document.addEventListener("DOMContentLoaded", async () => {

    try {

        const app = new App();

        await app.initialize();

        const DEBUG =
            location.hostname === "localhost" ||
            location.hostname === "127.0.0.1";

        if (DEBUG) {
            window.app = app;
        }

    }

    catch (error) {

        console.error(
            "[App] Falha durante a inicialização:",
            error
        );

    }

});
