/*
==========================================================
CCNA Exam Simulator
UI Manager
==========================================================

Responsabilidades

• Centralizar acesso ao DOM
• Registrar elementos da interface
• Manipular estado visual dos componentes

Este módulo NÃO:

• Renderiza questões
• Calcula score
• Controla Timer
• Controla navegação

==========================================================
*/

class UIManager {

    constructor(app) {

        this.app = app;

        this.elements = {};

    }

    /*
    ======================================================
    Inicialização
    ======================================================
    */

    initialize() {

        this.cacheElements();

    }

    /*
    ======================================================
    Cache dos Elementos
    ======================================================
    */

    cacheElements() {

    this.elements = {

        question:
            document.getElementById("question"),

        answers:
            document.getElementById("answers"),

        explanation:
            document.getElementById("explanation"),

        image:
            document.getElementById("image"),

        scenario:
            document.getElementById("scenario"),

        progressBar:
            document.getElementById("progressBar"),

        progressText:
            document.getElementById("progressText"),

        timer:
            document.getElementById("timer"),

        previousButton:
            document.getElementById("previousButton"),

        nextButton:
            document.getElementById("nextButton"),

        finishButton:
            document.getElementById("finishButton"),

        reviewButton:
            document.getElementById("reviewButton"),

        navigationPanel:
            document.getElementById("navigationPanel"),

        questionCounter:
            document.getElementById("questionCounter"),

        answeredCount:
            document.getElementById("answeredCount"),

        remainingCount:
            document.getElementById("remainingCount"),

        reviewCount:
            document.getElementById("reviewCount"),

        statisticsAnswered:
            document.getElementById("statisticsAnswered"),

        statisticsRemaining:
            document.getElementById("statisticsRemaining"),

        statisticsReview:
            document.getElementById("statisticsReview"),

        statisticsTime:
            document.getElementById("statisticsTime"),

        resultCorrect:
            document.getElementById("resultCorrect"),

        resultIncorrect:
            document.getElementById("resultIncorrect"),

        resultTotal:
            document.getElementById("resultTotal"),

        resultPercentage:
            document.getElementById("resultPercentage"),

        resultStatus:
            document.getElementById("resultStatus"),

        reviewQuestions:
            document.getElementById("reviewQuestions"),

        statusBar:
            document.getElementById("statusBar"),

        sidebar:
            document.getElementById("sidebar"),

        modal:
            document.getElementById("modal"),

        loading:
            document.getElementById("loading"),

    };

}

    /*
    ======================================================
    Acesso
    ======================================================
    */

    get(name) {

        return this.elements[name] || null;

    }

    exists(name) {

        return this.get(name) !== null;

    }

    /*
    ======================================================
    Texto
    ======================================================
    */

    setText(name, value) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.textContent = value;

    }

    setHTML(name, value) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.innerHTML = value;

    }

    setValue(name, value) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.value = value;

    }

    clear(name) {

        this.setHTML(name, "");

    }

    /*
    ======================================================
    Visibilidade
    ======================================================
    */

    show(name) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.hidden = false;

    }

    hide(name) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.hidden = true;

    }

    toggle(name) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.hidden = !element.hidden;

    }
	
	    /*
    ======================================================
    Estado dos Controles
    ======================================================
    */

    enable(name) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.disabled = false;

    }

    disable(name) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.disabled = true;

    }

    
    setEnabled(name, enabled) {

        if (enabled) {

            this.enable(name);

        } else {

            this.disable(name);

        }

    }

    setVisible(name, visible) {

        if (visible) {

            this.show(name);

        } else {

            this.hide(name);

        }

    }

/*
    ======================================================
    Classes CSS
    ======================================================
    */

    addClass(name, className) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.classList.add(className);

    }

    removeClass(name, className) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.classList.remove(className);

    }

    toggleClass(name, className, force = null) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        if (force === null) {
            element.classList.toggle(className);
        } else {
            element.classList.toggle(className, force);
        }

    }

    hasClass(name, className) {

        const element = this.get(name);

        if (!element) {

            return false;

        }

        return element.classList.contains(className);

    }

    /*
    ======================================================
    Eventos
    ======================================================
    */

    bindEvent(name, event, handler) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.addEventListener(

            event,

            handler

        );

    }

    unbindEvent(name, event, handler) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.removeEventListener(

            event,

            handler

        );

    }

    /*
    ======================================================
    Foco
    ======================================================
    */

    focus(name) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.focus();

    }

    blur(name) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.blur();

    }

    /*
    ======================================================
    Atributos
    ======================================================
    */

    setAttribute(name, attribute, value) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.setAttribute(

            attribute,

            value

        );

    }

    getAttribute(name, attribute) {

        const element = this.get(name);

        if (!element) {

            return null;

        }

        return element.getAttribute(attribute);

    }

    removeAttribute(name, attribute) {

        const element = this.get(name);

        if (!element) {

            return;

        }

        element.removeAttribute(attribute);

    }

    /*
    ======================================================
    Limpeza
    ======================================================
    */

    destroy() {

        this.elements = {};

    }

}
