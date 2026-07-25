/*
==========================================================
CCNA Exam Simulator
Question Type Renderer

Arquivo: js/ui/QuestionTypeRenderer.js
==========================================================
*/

class QuestionTypeRenderer {

    constructor() {

        this.draggedElement = null;

    }


    /*
    ======================================================
    RENDER PRINCIPAL
    ======================================================
    */

    render(question, container, onChange = null) {

        if (!question || !container) {
            return false;
        }

        const type =
            String(
                question.type || "single"
            ).toLowerCase();


        switch (type) {

            case "single":
            case "multiple-choice":
                return this.renderSingleChoice(
                    question,
                    container,
                    onChange
                );


            case "multiple":
            case "multiple-response":
                return this.renderMultipleResponse(
                    question,
                    container,
                    onChange
                );


            case "matching":
            case "dragdrop":
            case "drag-and-drop":
                return this.renderMatching(
                    question,
                    container,
                    onChange
                );


            case "ordering":
            case "order":
                return this.renderOrdering(
                    question,
                    container,
                    onChange
                );


            case "cli":
                return this.renderCLI(
                    question,
                    container,
                    onChange
                );


            case "lab":
            case "simulation":
                return this.renderLab(
                    question,
                    container,
                    onChange
                );


            default:

                console.warn(
                    `[QuestionTypeRenderer] Tipo não reconhecido: ${type}`
                );

                return false;

        }

    }


    /*
    ======================================================
    SINGLE CHOICE
    ======================================================
    */

    renderSingleChoice(
        question,
        container,
        onChange
    ) {

        container.innerHTML = "";

        const wrapper =
            this.createWrapper(
                "single-choice"
            );


        const list =
            document.createElement("div");

        list.className =
            "answer-list";


        const selectedAnswers =
            this.getUserAnswers(
                question
            );


        const answers =
            this.getAnswers(
                question
            );


        answers.forEach(answer => {

            const answerId =
                this.getAnswerId(
                    answer
                );


            const label =
                document.createElement("label");

            label.className =
                "answer-option";


            const input =
                document.createElement("input");

            input.type =
                "radio";

            input.name =
                `question-${this.getQuestionId(question)}`;

            input.value =
                answerId;


            if (
                selectedAnswers.includes(
                    String(answerId)
                )
            ) {

                input.checked = true;

                label.classList.add(
                    "selected"
                );

            }


            const text =
                document.createElement("span");

            text.className =
                "answer-text";

            text.textContent =
                this.getAnswerText(
                    answer
                );


            input.addEventListener(
                "change",
                () => {

                    /*
                    Radio garante somente
                    uma resposta selecionada.
                    */

                    this.setQuestionAnswers(
                        question,
                        [answerId]
                    );


                    list
                        .querySelectorAll(
                            ".answer-option"
                        )
                        .forEach(option => {

                            option.classList.remove(
                                "selected"
                            );

                        });


                    label.classList.add(
                        "selected"
                    );


                    this.notifyChange(
                        onChange,
                        question
                    );

                }
            );


            label.appendChild(input);
            label.appendChild(text);

            list.appendChild(label);

        });


        wrapper.appendChild(list);

        container.appendChild(wrapper);


        return true;

    }


    /*
    ======================================================
    MULTIPLE RESPONSE
    ======================================================
    */

    renderMultipleResponse(
        question,
        container,
        onChange
    ) {

        container.innerHTML = "";

        const wrapper =
            this.createWrapper(
                "multiple-response"
            );


        const instruction =
            document.createElement("div");

        instruction.className =
            "multiple-response-instruction";

        instruction.textContent =
            "Selecione todas as alternativas que se aplicam.";


        wrapper.appendChild(
            instruction
        );


        const list =
            document.createElement("div");

        list.className =
            "answer-list";


        const selectedAnswers =
            this.getUserAnswers(
                question
            );


        const answers =
            this.getAnswers(
                question
            );


        answers.forEach(answer => {

            const answerId =
                this.getAnswerId(
                    answer
                );


            const label =
                document.createElement("label");

            label.className =
                "answer-option";


            const input =
                document.createElement("input");

            input.type =
                "checkbox";

            input.value =
                answerId;


            if (
                selectedAnswers.includes(
                    String(answerId)
                )
            ) {

                input.checked = true;

                label.classList.add(
                    "selected"
                );

            }


            const text =
                document.createElement("span");

            text.className =
                "answer-text";

            text.textContent =
                this.getAnswerText(
                    answer
                );


            input.addEventListener(
                "change",
                () => {

                    const selected = [];

                    list
                        .querySelectorAll(
                            'input[type="checkbox"]:checked'
                        )
                        .forEach(item => {

                            selected.push(
                                String(item.value)
                            );

                        });


                    this.setQuestionAnswers(
                        question,
                        selected
                    );


                    label.classList.toggle(
                        "selected",
                        input.checked
                    );


                    this.notifyChange(
                        onChange,
                        question
                    );

                }
            );


            label.appendChild(input);
            label.appendChild(text);

            list.appendChild(label);

        });


        wrapper.appendChild(list);

        container.appendChild(wrapper);


        return true;

    }


    /*
    ======================================================
    MATCHING / DRAG AND DROP
    ======================================================
    */

    renderMatching(
        question,
        container,
        onChange
    ) {

        container.innerHTML = "";


        const wrapper =
            this.createWrapper(
                "matching"
            );


        wrapper.appendChild(
            this.createInstruction(
                "Arraste cada item para a correspondência correta."
            )
        );


        const matchingData =
            question.dragdrop ||
            question.matching ||
            {};


        const sources =
            matchingData.items ||
            matchingData.sources ||
            [];


        const targets =
            matchingData.targets ||
            [];


        const area =
            document.createElement("div");

        area.className =
            "matching-container";


        /*
        --------------------------------------------------
        COLUNA DE ITENS
        --------------------------------------------------
        */

        const sourceColumn =
            document.createElement("div");

        sourceColumn.className =
            "matching-column";


        sourceColumn.appendChild(
            this.createColumnTitle(
                "Itens"
            )
        );


        const sourceList =
            document.createElement("div");

        sourceList.className =
            "matching-items";


        sources.forEach(
            (source, index) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "matching-item";

                item.draggable = true;


                item.dataset.id =
                    String(
                        source.id ??
                        index
                    );


                item.textContent =
                    source.text ??
                    source.label ??
                    String(source);


                this.configureDraggable(
                    item
                );


                sourceList.appendChild(
                    item
                );

            }
        );


        sourceColumn.appendChild(
            sourceList
        );


        /*
        --------------------------------------------------
        COLUNA DE DESTINOS
        --------------------------------------------------
        */

        const targetColumn =
            document.createElement("div");

        targetColumn.className =
            "matching-column";


        targetColumn.appendChild(
            this.createColumnTitle(
                "Correspondência"
            )
        );


        const targetList =
            document.createElement("div");

        targetList.className =
            "matching-items";


        targets.forEach(
            (target, index) => {

                const block =
                    document.createElement(
                        "div"
                    );


                const title =
                    document.createElement(
                        "div"
                    );

                title.className =
                    "matching-column-title";

                title.textContent =
                    target.text ??
                    target.label ??
                    String(target);


                const dropZone =
                    document.createElement(
                        "div"
                    );

                dropZone.className =
                    "matching-target";


                dropZone.dataset.targetId =
                    String(
                        target.id ??
                        index
                    );


                this.configureDropZone(
                    dropZone,
                    question,
                    area,
                    onChange
                );


                block.appendChild(title);
                block.appendChild(dropZone);

                targetList.appendChild(
                    block
                );

            }
        );


        targetColumn.appendChild(
            targetList
        );


        area.appendChild(
            sourceColumn
        );

        area.appendChild(
            targetColumn
        );


        wrapper.appendChild(area);

        container.appendChild(wrapper);


        return true;

    }


    /*
    ======================================================
    CONFIGURAR ITEM ARRASTÁVEL
    ======================================================
    */

    configureDraggable(element) {

        element.addEventListener(
            "dragstart",
            event => {

                this.draggedElement =
                    element;


                element.classList.add(
                    "dragging"
                );


                event.dataTransfer.effectAllowed =
                    "move";


                event.dataTransfer.setData(
                    "text/plain",
                    element.dataset.id
                );

            }
        );


        element.addEventListener(
            "dragend",
            () => {

                element.classList.remove(
                    "dragging"
                );

                this.draggedElement = null;

            }
        );

    }


    /*
    ======================================================
    DROP ZONE
    ======================================================
    */

    configureDropZone(
        dropZone,
        question,
        matchingArea,
        onChange
    ) {

        dropZone.addEventListener(
            "dragover",
            event => {

                event.preventDefault();

                event.dataTransfer.dropEffect =
                    "move";


                dropZone.classList.add(
                    "drag-over"
                );

            }
        );


        dropZone.addEventListener(
            "dragleave",
            () => {

                dropZone.classList.remove(
                    "drag-over"
                );

            }
        );


        dropZone.addEventListener(
            "drop",
            event => {

                event.preventDefault();


                dropZone.classList.remove(
                    "drag-over"
                );


                if (!this.draggedElement) {
                    return;
                }


                /*
                Se já existe um item no destino,
                ele volta para a lista original.
                */

                const existing =
                    dropZone.querySelector(
                        ".matching-item"
                    );


                if (existing) {

                    const sourceList =
                        matchingArea.querySelector(
                            ".matching-column:first-child .matching-items"
                        );


                    if (sourceList) {

                        sourceList.appendChild(
                            existing
                        );

                    }

                }


                dropZone.appendChild(
                    this.draggedElement
                );


                dropZone.classList.add(
                    "filled"
                );


                const response =
                    this.collectMatchingResponse(
                        matchingArea
                    );


                this.setQuestionAnswers(
                    question,
                    response
                );


                this.notifyChange(
                    onChange,
                    question
                );

            }
        );

    }


    /*
    ======================================================
    COLETAR MATCHING
    ======================================================
    */

    collectMatchingResponse(area) {

        const response = [];


        area
            .querySelectorAll(
                ".matching-target"
            )
            .forEach(target => {

                const item =
                    target.querySelector(
                        ".matching-item"
                    );


                if (!item) {
                    return;
                }


                response.push(
                    `${item.dataset.id}:${target.dataset.targetId}`
                );

            });


        return response;

    }


    /*
    ======================================================
    ORDERING
    ======================================================
    */

    renderOrdering(
        question,
        container,
        onChange
    ) {

        container.innerHTML = "";


        const wrapper =
            this.createWrapper(
                "ordering"
            );


        wrapper.appendChild(
            this.createInstruction(
                "Organize os itens na sequência correta."
            )
        );


        const data =
            question.ordering ||
            question.order ||
            question.dragdrop ||
            {};


        const items =
            data.items ||
            [];


        const list =
            document.createElement("div");

        list.className =
            "ordering-list";


        items.forEach(
            (itemData, index) => {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "ordering-item";

                item.draggable = true;


                item.dataset.id =
                    String(
                        itemData.id ??
                        index
                    );


                const handle =
                    document.createElement(
                        "span"
                    );

                handle.className =
                    "ordering-handle";

                handle.textContent =
                    "☰";


                const position =
                    document.createElement(
                        "span"
                    );

                position.className =
                    "ordering-position";

                position.textContent =
                    index + 1;


                const text =
                    document.createElement(
                        "span"
                    );

                text.className =
                    "ordering-text";

                text.textContent =
                    itemData.text ??
                    itemData.label ??
                    String(itemData);


                item.appendChild(handle);
                item.appendChild(position);
                item.appendChild(text);


                this.configureOrderingItem(
                    item,
                    list,
                    question,
                    onChange
                );


                list.appendChild(item);

            }
        );


        wrapper.appendChild(list);

        container.appendChild(wrapper);


        return true;

    }


    /*
    ======================================================
    ORDERING DRAG
    ======================================================
    */

    configureOrderingItem(
        item,
        list,
        question,
        onChange
    ) {

        item.addEventListener(
            "dragstart",
            () => {

                this.draggedElement =
                    item;


                item.classList.add(
                    "dragging"
                );

            }
        );


        item.addEventListener(
            "dragend",
            () => {

                item.classList.remove(
                    "dragging"
                );


                this.draggedElement = null;


                this.updateOrderingPositions(
                    list
                );


                const response =
                    Array.from(
                        list.querySelectorAll(
                            ".ordering-item"
                        )
                    ).map(
                        element =>
                            String(
                                element.dataset.id
                            )
                    );


                this.setQuestionAnswers(
                    question,
                    response
                );


                this.notifyChange(
                    onChange,
                    question
                );

            }
        );


        item.addEventListener(
            "dragover",
            event => {

                event.preventDefault();


                if (
                    !this.draggedElement ||
                    this.draggedElement === item
                ) {

                    return;

                }


                const rect =
                    item.getBoundingClientRect();


                const midpoint =
                    rect.top +
                    rect.height / 2;


                if (
                    event.clientY <
                    midpoint
                ) {

                    list.insertBefore(
                        this.draggedElement,
                        item
                    );

                } else {

                    list.insertBefore(
                        this.draggedElement,
                        item.nextSibling
                    );

                }

            }
        );

    }


    /*
    ======================================================
    ATUALIZAR POSIÇÕES
    ======================================================
    */

    updateOrderingPositions(list) {

        list
            .querySelectorAll(
                ".ordering-item"
            )
            .forEach(
                (item, index) => {

                    const position =
                        item.querySelector(
                            ".ordering-position"
                        );


                    if (position) {

                        position.textContent =
                            index + 1;

                    }

                }
            );

    }


    /*
    ======================================================
    CLI
    ======================================================
    */

    renderCLI(
        question,
        container,
        onChange
    ) {

        container.innerHTML = "";


        const wrapper =
            this.createWrapper(
                "cli"
            );


        wrapper.appendChild(
            this.createInstruction(
                "Analise o terminal e execute os comandos necessários."
            )
        );


        const cli =
            document.createElement("div");

        cli.className =
            "cli-container";


        const header =
            document.createElement("div");

        header.className =
            "cli-header";


        const title =
            document.createElement("span");

        title.className =
            "cli-title";

        title.textContent =
            "Cisco IOS CLI";


        header.appendChild(title);


        const terminal =
            document.createElement("div");

        terminal.className =
            "cli-terminal";


        const output =
            document.createElement("div");

        output.className =
            "cli-output";


        const initialOutput =
            this.getCLIInitialOutput(
                question
            );


        if (initialOutput) {

            const initial =
                document.createElement(
                    "div"
                );

            initial.className =
                "cli-line";

            initial.textContent =
                initialOutput;


            output.appendChild(
                initial
            );

        }


        const inputRow =
            document.createElement("div");

        inputRow.className =
            "cli-input-row";


        const prompt =
            document.createElement("span");

        prompt.className =
            "cli-prompt";

        prompt.textContent =
            this.getCLIPrompt(
                question
            );


        const input =
            document.createElement("input");

        input.type = "text";

        input.className =
            "cli-input";

        input.autocomplete =
            "off";

        input.spellcheck =
            false;


        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key !==
                    "Enter"
                ) {

                    return;

                }


                event.preventDefault();


                const command =
                    input.value.trim();


                if (!command) {
                    return;
                }


                this.executeCLICommand(
                    question,
                    command,
                    output
                );


                input.value = "";


                this.notifyChange(
                    onChange,
                    question
                );

            }
        );


        inputRow.appendChild(prompt);
        inputRow.appendChild(input);


        terminal.appendChild(output);
        terminal.appendChild(inputRow);


        cli.appendChild(header);
        cli.appendChild(terminal);


        wrapper.appendChild(cli);

        container.appendChild(wrapper);


        return true;

    }


    /*
    ======================================================
    EXECUTAR COMANDO CLI
    ======================================================
    */

    executeCLICommand(
        question,
        command,
        output
    ) {

        const commandLine =
            document.createElement("div");

        commandLine.className =
            "cli-line";


        commandLine.textContent =
            `${this.getCLIPrompt(question)}${command}`;


        output.appendChild(
            commandLine
        );


        /*
        Procurar resposta definida no banco.
        */

        const cliData =
            question.cli || {};


        const commands =
            cliData.commands || {};


        const normalized =
            command
                .trim()
                .toLowerCase();


        let response = null;


        Object.keys(commands)
            .some(key => {

                if (
                    key.trim().toLowerCase() ===
                    normalized
                ) {

                    response =
                        commands[key];

                    return true;

                }

                return false;

            });


        const responseLine =
            document.createElement("div");

        responseLine.className =
            "cli-line";


        if (response !== null) {

            responseLine.textContent =
                String(response);

        } else {

            responseLine.textContent =
                "% Comando não reconhecido ou não disponível nesta simulação.";

        }


        output.appendChild(
            responseLine
        );


        output.scrollTop =
            output.scrollHeight;

    }


    /*
    ======================================================
    LAB
    ======================================================
    */

    renderLab(
        question,
        container,
        onChange
    ) {

        container.innerHTML = "";


        const wrapper =
            this.createWrapper(
                "lab"
            );


        const lab =
            question.lab || {};


        if (lab.instructions) {

            wrapper.appendChild(
                this.createInstruction(
                    lab.instructions
                )
            );

        }


        const labContainer =
            document.createElement("div");

        labContainer.className =
            "lab-container";


        const toolbar =
            document.createElement("div");

        toolbar.className =
            "lab-toolbar";


        const title =
            document.createElement("h3");

        title.className =
            "lab-title";

        title.textContent =
            lab.title ||
            "Laboratório";


        toolbar.appendChild(title);


        const workspace =
            document.createElement("div");

        workspace.className =
            "lab-workspace";


        /*
        O LabRenderer existente no projeto
        poderá assumir este workspace.

        Disparamos um evento para manter
        os componentes desacoplados.
        */

        labContainer.appendChild(
            toolbar
        );

        labContainer.appendChild(
            workspace
        );


        wrapper.appendChild(
            labContainer
        );


        container.appendChild(
            wrapper
        );


        document.dispatchEvent(
            new CustomEvent(
                "exam:labRequested",
                {
                    detail: {

                        question,
                        lab,
                        workspace,

                        onChange

                    }
                }
            )
        );


        return true;

    }


    /*
    ======================================================
    HELPERS
    ======================================================
    */

    createWrapper(type) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            `question-type-container question-type-${type}`;


        return wrapper;

    }


    createInstruction(text) {

        const element =
            document.createElement("div");

        element.className =
            "question-instruction";

        element.textContent =
            text;


        return element;

    }


    createColumnTitle(text) {

        const title =
            document.createElement("div");

        title.className =
            "matching-column-title";

        title.textContent =
            text;


        return title;

    }


    /*
    ======================================================
    COMPATIBILIDADE COM QUESTION MODEL
    ======================================================
    */

    getQuestionId(question) {

        if (
            typeof question.getId ===
            "function"
        ) {

            return question.getId();

        }

        return question.id || "";

    }


    getAnswers(question) {

        if (
            typeof question.getAnswers ===
            "function"
        ) {

            return question.getAnswers();

        }

        return Array.isArray(
            question.answers
        )
            ? question.answers
            : [];

    }


    getAnswerId(answer) {

        if (
            typeof answer.getId ===
            "function"
        ) {

            return String(
                answer.getId()
            );

        }

        return String(
            answer.id ?? ""
        );

    }


    getAnswerText(answer) {

        if (
            typeof answer.getText ===
            "function"
        ) {

            return answer.getText();

        }


        return (
            answer.text ??
            answer.answer ??
            answer.label ??
            ""
        );

    }


    getUserAnswers(question) {

        if (
            typeof question.getUserAnswers ===
            "function"
        ) {

            return question
                .getUserAnswers()
                .map(String);

        }


        if (
            Array.isArray(
                question.userAnswers
            )
        ) {

            return question.userAnswers
                .map(String);

        }


        return [];

    }


    /*
    ======================================================
    GRAVAR RESPOSTAS
    ======================================================
    */

    setQuestionAnswers(
        question,
        answers
    ) {

        const normalized =
            Array.isArray(answers)
                ? answers.map(String)
                : [];


        if (
            typeof question.setAnswers ===
            "function"
        ) {

            question.setAnswers(
                normalized
            );

            return;

        }


        question.userAnswers =
            normalized;

        question.answered =
            normalized.length > 0;

    }


    /*
    ======================================================
    NOTIFICAR ALTERAÇÃO
    ======================================================
    */

    notifyChange(
        callback,
        question
    ) {

        if (
            typeof callback ===
            "function"
        ) {

            callback(question);

        }


        document.dispatchEvent(
            new CustomEvent(
                "exam:answerChanged",
                {
                    detail: {
                        question
                    }
                }
            )
        );

    }


    /*
    ======================================================
    CLI HELPERS
    ======================================================
    */

    getCLIInitialOutput(question) {

        const cli =
            question.cli || {};


        return (
            cli.initialOutput ||
            cli.output ||
            ""
        );

    }


    getCLIPrompt(question) {

        const cli =
            question.cli || {};


        return (
            cli.prompt ||
            "Router#"
        );

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.QuestionTypeRenderer =
    QuestionTypeRenderer;
