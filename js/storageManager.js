/*
==========================================================
CCNA Exam Simulator
Storage Manager
==========================================================

Responsabilidades

• Salvar estado da prova
• Restaurar estado da prova
• Remover estado salvo

Este módulo NÃO conhece:

• Renderer
• UI
• Timer
• QuestionManager

==========================================================
*/

class StorageManager {

    constructor(app) {

        this.app = app;

        this.storageKey = "ccna_exam_state";

        this.version = "1.0";

    }

    /*
    ======================================================
    Configuração
    ======================================================
    */

    getStorageKey() {

        return this.storageKey;

    }

    setStorageKey(key) {

        this.storageKey = key;

    }

    /*
    ======================================================
    Persistência
    ======================================================
    */

    save() {

        const engine = this.app.examEngine;

        if (!engine.isInitialized()) {

            return false;

        }

        const exam = engine.getExam();

        const state = {

            version: this.version,

            currentIndex: engine.getCurrentIndex(),

            finished: engine.isFinished(),

            questions: exam.getQuestions().map(question => ({

                id: question.getId(),

                answers: question.getUserAnswers(),

                review: question.review,

                visited: question.wasVisited()

            }))

        };

        localStorage.setItem(

            this.storageKey,

            JSON.stringify(state)

        );

        return true;

    }

    /*
    ======================================================
    Recuperação
    ======================================================
    */

    load() {

        const json = localStorage.getItem(

            this.storageKey

        );

        if (!json) {

            return null;

        }

        try {

            return JSON.parse(json);

        }

        catch (error) {

            console.error(error);

            return null;

        }

    }

    /*
    ======================================================
    Estado salvo?
    ======================================================
    */

    exists() {

        return (

            localStorage.getItem(

                this.storageKey

            ) !== null

        );

    }
	
	    /*
    ======================================================
    Restauração
    ======================================================
    */

    restore() {

        const state = this.load();

        if (!state) {

            return false;

        }

        if (!this.validateState(state)) {

            return false;

        }

        const engine = this.app.examEngine;

        if (!engine.isInitialized()) {

            return false;

        }

        const exam = engine.getExam();

        state.questions.forEach(savedQuestion => {

            const question = exam
                .getQuestions()
                .find(q => q.getId() === savedQuestion.id);

            if (!question) {

                return;

            }

            question.clearAnswers();

            if (Array.isArray(savedQuestion.answers)) {

                savedQuestion.answers.forEach(answerId => {

                    question.answer(answerId);

                });

            }

            question.review = Boolean(savedQuestion.review);

            if (savedQuestion.visited) {

                question.visit();

            }

        });

        engine.goTo(state.currentIndex);

        if (state.finished) {

            engine.finish();

        }

        return true;

    }

    /*
    ======================================================
    Validação
    ======================================================
    */

    validateState(state) {

        if (!state) {

            return false;

        }

        if (state.version !== this.version) {

            console.warn(

                "Saved exam version is incompatible."

            );

            return false;

        }

        if (!Array.isArray(state.questions)) {

            return false;

        }

        return true;

    }

    /*
    ======================================================
    Remoção
    ======================================================
    */

    remove() {

        localStorage.removeItem(

            this.storageKey

        );

    }

    clear() {

        this.remove();

    }

}