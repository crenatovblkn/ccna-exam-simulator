/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
QuestionRenderer

Responsabilidade:
- Renderizar a questão atual
- Renderizar alternativas
- Suportar single / multiple
- Suportar exhibit / CLI
- Suportar drag and drop
- Suportar matching
- Suportar ordering
- Encaminhar LAB para LabRenderer
- Restaurar visualmente respostas já registradas
- NÃO calcular pontuação
==========================================================
*/

class QuestionRenderer {

    constructor(options = {}) {

        this.engine =
            options.engine || null;

        this.labRenderer =
            options.labRenderer || null;

        this.elements = {};

        this.draggedItem = null;

        this.matchingSelection = {
            left: null,
            right: null
        };

        this.cacheElements();

    }


    /*
    ======================================================
    ELEMENTOS
    ======================================================
    */

    cacheElements() {

        this.elements.questionDomain =
            document.getElementById(
                "questionDomain"
            );

        this.elements.questionType =
            document.getElementById(
                "questionType"
            );

        this.elements.questionInstruction =
            document.getElementById(
                "questionInstruction"
            );

        this.elements.questionText =
            document.getElementById(
                "questionText"
            );

        this.elements.questionContent =
            document.getElementById(
                "questionContent"
            );

        this.elements.answerContainer =
            document.getElementById(
                "answerContainer"
            );

        this.elements.exhibitContainer =
            document.getElementById(
                "exhibitContainer"
            );

        this.elements.exhibitContent =
            document.getElementById(
                "exhibitContent"
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


    setLabRenderer(renderer) {

        this.labRenderer = renderer;

    }


    /*
    ======================================================
    RENDER
    ======================================================
    */

    render(question = null) {

        if (!question) {

            if (this.engine) {

                question =
                    this.engine
                        .getCurrentQuestion();

            }

        }


        if (!question) {

            this.renderEmpty();

            return;

        }


        this.clear();

        this.renderHeader(question);

        this.renderInstruction(question);

        this.renderQuestionText(question);

        this.renderMedia(question);

        this.renderExhibit(question);


        switch (
            question.getType()
        ) {

            case "single":

                this.renderSingle(question);

                break;


            case "multiple":

                this.renderMultiple(question);

                break;


            case "exhibit":

                this.renderChoiceQuestion(
                    question
                );

                break;


            case "cli":

                this.renderCli(question);

                break;


            case "dragdrop":

                this.renderDragDrop(
                    question
                );

                break;


            case "matching":

                this.renderMatching(
                    question
                );

                break;


            case "ordering":

                this.renderOrdering(
                    question
                );

                break;


            case "lab":

                this.renderLab(
                    question
                );

                break;


            default:

                this.renderUnsupported(
                    question
                );

        }

    }


    /*
    ======================================================
    LIMPEZA
    ======================================================
    */

    clear() {

        this.draggedItem = null;

        this.matchingSelection = {
            left: null,
            right: null
        };


        if (
            this.elements.answerContainer
        ) {

            this.elements
                .answerContainer
                .innerHTML = "";

        }


        if (
            this.elements.exhibitContent
        ) {

            this.elements
                .exhibitContent
                .innerHTML = "";

        }


        if (
            this.elements.exhibitContainer
        ) {

            this.elements
                .exhibitContainer
                .classList.add(
                    "hidden"
                );

        }

    }


    /*
    ======================================================
    HEADER
    ======================================================
    */

    renderHeader(question) {

        if (
            this.elements.questionDomain
        ) {

            this.elements
                .questionDomain
                .textContent =
                question.getDomain();

        }


        if (
            this.elements.questionType
        ) {

            this.elements
                .questionType
                .textContent =
                this.getTypeLabel(
                    question.getType()
                );

        }

    }


    /*
    ======================================================
    INSTRUÇÃO
    ======================================================
    */

    renderInstruction(question) {

        const element =
            this.elements
                .questionInstruction;


        if (!element) {

            return;

        }


        let instruction =
            question.getInstruction();


        if (!instruction) {

            instruction =
                this.getDefaultInstruction(
                    question
                );

        }


        if (instruction) {

            element.textContent =
                instruction;

            element.classList.remove(
                "hidden"
            );

        } else {

            element.textContent = "";

            element.classList.add(
                "hidden"
            );

        }

    }


    /*
    ======================================================
    ENUNCIADO
    ======================================================
    */

    renderQuestionText(question) {

        if (
            !this.elements.questionText
        ) {

            return;

        }


        this.elements
            .questionText
            .innerHTML =
            this.formatText(
                question.getQuestion()
            );

    }


    /*
    ======================================================
    IMAGEM
    ======================================================
    */

    renderMedia(question) {

        const image =
            question.getImage();


        if (!image) {

            return;

        }


        const container =
            document.createElement(
                "div"
            );


        container.className =
            "question-image-container";


        const img =
            document.createElement(
                "img"
            );


        img.src = image;

        img.alt =
            "Question exhibit";

        img.loading =
            "lazy";


        container.appendChild(
            img
        );


        if (
            this.elements.questionContent
        ) {

            this.elements
                .questionContent
                .appendChild(
                    container
                );

        }

    }


    /*
    ======================================================
    EXHIBIT
    ======================================================
    */

    renderExhibit(question) {

        const exhibit =
            question.getExhibit();


        if (!exhibit) {

            return;

        }


        if (
            !this.elements.exhibitContainer ||
            !this.elements.exhibitContent
        ) {

            return;

        }


        this.elements
            .exhibitContainer
            .classList.remove(
                "hidden"
            );


        this.renderExhibitContent(
            exhibit,
            this.elements
                .exhibitContent
        );

    }


    /*
    ======================================================
    CONTEÚDO DO EXHIBIT
    ======================================================
    */

    renderExhibitContent(
        exhibit,
        container
    ) {

        if (
            typeof exhibit ===
            "string"
        ) {

            const block =
                document.createElement(
                    "div"
                );


            block.innerHTML =
                this.formatText(
                    exhibit
                );


            container.appendChild(
                block
            );


            return;

        }


        if (
            !exhibit ||
            typeof exhibit !==
            "object"
        ) {

            return;

        }


        /*
        Imagem
        */

        if (exhibit.image) {

            const imageContainer =
                document.createElement(
                    "div"
                );


            imageContainer.className =
                "question-image-container";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                exhibit.image;

            image.alt =
                exhibit.alt ||
                "Exhibit";

            image.loading =
                "lazy";


            imageContainer
                .appendChild(
                    image
                );


            container.appendChild(
                imageContainer
            );

        }


        /*
        Texto
        */

        if (exhibit.text) {

            const text =
                document.createElement(
                    "div"
                );


            text.className =
                "scenario-container";


            text.innerHTML =
                this.formatText(
                    exhibit.text
                );


            container.appendChild(
                text
            );

        }


        /*
        Código / saída CLI
        */

        if (
            exhibit.code ||
            exhibit.cli
        ) {

            this.createCodeBlock(
                exhibit.code ||
                exhibit.cli,
                container,
                exhibit.title ||
                "CLI Output"
            );

        }


        /*
        Tabela
        */

        if (
            Array.isArray(
                exhibit.headers
            ) &&
            Array.isArray(
                exhibit.rows
            )
        ) {

            this.createTable(
                exhibit.headers,
                exhibit.rows,
                container
            );

        }

    }


    /*
    ======================================================
    SINGLE
    ======================================================
    */

    renderSingle(question) {

        this.renderChoiceQuestion(
            question,
            "radio"
        );

    }


    /*
    ======================================================
    MULTIPLE
    ======================================================
    */

    renderMultiple(question) {

        this.renderChoiceQuestion(
            question,
            "checkbox"
        );

    }


    /*
    ======================================================
    SINGLE / MULTIPLE / EXHIBIT / CLI
    ======================================================
    */

    renderChoiceQuestion(
        question,
        forcedInputType = null
    ) {

        const container =
            this.elements
                .answerContainer;


        if (!container) {

            return;

        }


        const inputType =
            forcedInputType ||
            (
                question.isMultipleChoice()
                    ? "checkbox"
                    : "radio"
            );


        const userAnswers =
            question.getUserAnswers();


        question
            .getAnswers()
            .forEach(
                (answer, index) => {

                    const label =
                        document.createElement(
                            "label"
                        );


                    label.className =
                        "answer-option";


                    const answerId =
                        String(
                            answer.getId()
                        );


                    if (
                        userAnswers.includes(
                            answerId
                        )
                    ) {

                        label.classList.add(
                            "selected"
                        );

                    }


                    /*
                    Input
                    */

                    const input =
                        document.createElement(
                            "input"
                        );


                    input.type =
                        inputType;

                    input.name =
                        `question-${question.getId()}`;

                    input.value =
                        answerId;

                    input.checked =
                        userAnswers.includes(
                            answerId
                        );


                    /*
                    Conteúdo
                    */

                    const content =
                        document.createElement(
                            "div"
                        );


                    content.className =
                        "answer-content";


                    /*
                    Letra
                    */

                    const letter =
                        document.createElement(
                            "span"
                        );


                    letter.className =
                        "answer-letter";

                    letter.textContent =
                        this.indexToLetter(
                            index
                        );


                    /*
                    Texto
                    */

                    const text =
                        document.createElement(
                            "div"
                        );


                    text.className =
                        "answer-text";


                    text.innerHTML =
                        this.formatText(
                            answer.getText()
                        );


                    /*
                    Código da alternativa
                    */

                    if (
                        answer.getCode()
                    ) {

                        const code =
                            document.createElement(
                                "pre"
                            );


                        code.textContent =
                            answer.getCode();


                        text.appendChild(
                            code
                        );

                    }


                    /*
                    Imagem da alternativa
                    */

                    if (
                        answer.getImage()
                    ) {

                        const image =
                            document.createElement(
                                "img"
                            );


                        image.src =
                            answer.getImage();

                        image.alt =
                            `Answer ${this.indexToLetter(index)}`;

                        image.loading =
                            "lazy";


                        text.appendChild(
                            image
                        );

                    }


                    content.appendChild(
                        letter
                    );

                    content.appendChild(
                        text
                    );


                    label.appendChild(
                        input
                    );

                    label.appendChild(
                        content
                    );


                    /*
                    Evento
                    */

                    input.addEventListener(
                        "change",
                        () => {

                            if (!this.engine) {

                                return;

                            }


                            this.engine.answer(
                                answerId
                            );


                            /*
                            Atualiza toda a lista.

                            Garante comportamento correto:
                            - single remove seleção anterior
                            - multiple permite marcar/desmarcar
                            */

                            this.render(
                                this.engine
                                    .getCurrentQuestion()
                            );

                        }
                    );


                    container.appendChild(
                        label
                    );

                }
            );

    }


    /*
    ======================================================
    CLI
    ======================================================
    */

    renderCli(question) {

    const cli =
        question.getCli();


    /*
    --------------------------------------------------
    CLI
    --------------------------------------------------
    */

    if (
        cli &&
        this.elements.exhibitContainer &&
        this.elements.exhibitContent
    ) {

        const title =
            cli.title ||
            "CLI Output";


        const output =
            cli.output ||
            cli.code ||
            cli.content ||
            "";


        /*
        --------------------------------------------------
        Torna o painel CLI visível
        --------------------------------------------------
        */

        this.elements
            .exhibitContainer
            .classList.remove(
                "hidden"
            );


        /*
        --------------------------------------------------
        Limpa conteúdo anterior
        --------------------------------------------------
        */

        this.elements
            .exhibitContent
            .innerHTML = "";


        /*
        --------------------------------------------------
        Cria bloco CLI diretamente
        --------------------------------------------------
        */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "code-block";


        const header =
            document.createElement(
                "div"
            );


        header.className =
            "code-block-header";


        header.textContent =
            title;


        const pre =
            document.createElement(
                "pre"
            );


        pre.className =
            "code-block-content";


        const code =
            document.createElement(
                "code"
            );


        code.textContent =
            output;


        pre.appendChild(
            code
        );


        wrapper.appendChild(
            header
        );


        wrapper.appendChild(
            pre
        );


        this.elements
            .exhibitContent
            .appendChild(
                wrapper
            );

    }


    /*
    --------------------------------------------------
    Alternativas da questão CLI
    --------------------------------------------------
    */

    this.renderChoiceQuestion(
        question,
        "radio"
    );

}
);
        

    /*
    --------------------------------------------------
    Renderiza a saída CLI
    --------------------------------------------------
    */

    if (cli) {

        let title =
            "CLI Output";

        let output =
            "";


        if (
            typeof cli ===
            "string"
        ) {

            output = cli;

        } else if (
            typeof cli ===
            "object"
        ) {

            title =
                cli.title ||
                "CLI Output";

            output =
                cli.output ||
                cli.code ||
                cli.content ||
                "";

        }


        /*
        --------------------------------------------------
        Prioridade 1:
        painel de exhibit
        --------------------------------------------------
        */

        if (
            this.elements.exhibitContainer &&
            this.elements.exhibitContent
        ) {

            this.elements
                .exhibitContainer
                .classList.remove(
                    "hidden"
                );


            this.createCodeBlock(
                output,
                this.elements
                    .exhibitContent,
                title
            );

        }

        /*
        --------------------------------------------------
        Fallback:
        exibe junto às respostas
        --------------------------------------------------
        */

        else if (
            this.elements.answerContainer
        ) {

            this.createCodeBlock(
                output,
                this.elements
                    .answerContainer,
                title
            );

        }

    }


    /*
    --------------------------------------------------
    Alternativas
    --------------------------------------------------
    */

    this.renderChoiceQuestion(
        question,
        "radio"
    );

}


    /*
    ======================================================
    DRAG AND DROP
    ======================================================
    */

    renderDragDrop(question) {

        const data =
            question.getDragdrop();


        const container =
            this.elements
                .answerContainer;


        if (
            !data ||
            !container
        ) {

            return;

        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "dragdrop-container";


        /*
        Coluna de itens
        */

        const sourceColumn =
            document.createElement(
                "div"
            );


        sourceColumn.className =
            "dragdrop-column";


        const sourceTitle =
            document.createElement(
                "h3"
            );


        sourceTitle.textContent =
            data.sourceTitle ||
            "Options";


        sourceColumn.appendChild(
            sourceTitle
        );


        const dragItems =
            document.createElement(
                "div"
            );


        dragItems.className =
            "drag-items";


        /*
        Destinos
        */

        const targetColumn =
            document.createElement(
                "div"
            );


        targetColumn.className =
            "dragdrop-column";


        const targetTitle =
            document.createElement(
                "h3"
            );


        targetTitle.textContent =
            data.targetTitle ||
            "Targets";


        targetColumn.appendChild(
            targetTitle
        );


        const dropTargets =
            document.createElement(
                "div"
            );


        dropTargets.className =
            "drop-targets";


        const userMap =
            question.getUserDragdrop();


        /*
        Descobre itens utilizados
        */

        const usedItems =
            new Set(
                Object.values(
                    userMap
                ).map(String)
            );


        /*
        Itens disponíveis
        */

        const items =
            Array.isArray(data.items)
                ? data.items
                : [];


        items.forEach(item => {

            const id =
                String(item.id);


            if (
                usedItems.has(id)
            ) {

                return;

            }


            dragItems.appendChild(
                this.createDragItem(
                    item
                )
            );

        });


        sourceColumn.appendChild(
            dragItems
        );


        /*
        Targets
        */

        const targets =
            Array.isArray(data.targets)
                ? data.targets
                : [];


        targets.forEach(target => {

            const targetId =
                String(target.id);


            const dropTarget =
                document.createElement(
                    "div"
                );


            dropTarget.className =
                "drop-target";


            dropTarget.dataset.targetId =
                targetId;


            const label =
                document.createElement(
                    "div"
                );


            label.className =
                "drop-target-label";

            label.textContent =
                target.text ||
                target.label ||
                targetId;


            const content =
                document.createElement(
                    "div"
                );


            content.className =
                "drop-target-content";


            const assignedItemId =
                userMap[targetId];


            if (
                assignedItemId !==
                undefined
            ) {

                const item =
                    items.find(
                        candidate =>
                            String(
                                candidate.id
                            ) ===
                            String(
                                assignedItemId
                            )
                    );


                if (item) {

                    dropTarget.classList.add(
                        "filled"
                    );


                    content.appendChild(
                        this.createDragItem(
                            item
                        )
                    );

                }

            } else {

                content.textContent =
                    "Drop item here";

            }


            dropTarget.appendChild(
                label
            );

            dropTarget.appendChild(
                content
            );


            /*
            Drag over
            */

            dropTarget.addEventListener(
                "dragover",
                event => {

                    event.preventDefault();

                    dropTarget
                        .classList.add(
                            "drag-over"
                        );

                }
            );


            dropTarget.addEventListener(
                "dragleave",
                () => {

                    dropTarget
                        .classList.remove(
                            "drag-over"
                        );

                }
            );


            /*
            Drop
            */

            dropTarget.addEventListener(
                "drop",
                event => {

                    event.preventDefault();


                    dropTarget
                        .classList.remove(
                            "drag-over"
                        );


                    const itemId =
                        event.dataTransfer
                            .getData(
                                "text/plain"
                            );


                    if (
                        !itemId ||
                        !this.engine
                    ) {

                        return;

                    }


                    this.engine
                        .setDragdropAnswer(
                            targetId,
                            itemId
                        );


                    this.render(
                        this.engine
                            .getCurrentQuestion()
                    );

                }
            );


            /*
            Duplo clique remove
            */

            dropTarget.addEventListener(
                "dblclick",
                () => {

                    if (
                        assignedItemId ===
                        undefined ||
                        !this.engine
                    ) {

                        return;

                    }


                    this.engine
                        .removeDragdropAnswer(
                            targetId
                        );


                    this.render(
                        this.engine
                            .getCurrentQuestion()
                    );

                }
            );


            dropTargets.appendChild(
                dropTarget
            );

        });


        targetColumn.appendChild(
            dropTargets
        );


        wrapper.appendChild(
            sourceColumn
        );

        wrapper.appendChild(
            targetColumn
        );


        container.appendChild(
            wrapper
        );

    }


    /*
    ======================================================
    CRIA ITEM DRAG
    ======================================================
    */

    createDragItem(item) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "drag-item";

        element.draggable =
            true;

        element.dataset.itemId =
            String(item.id);

        element.innerHTML =
            this.formatText(
                item.text ||
                item.label ||
                String(item.id)
            );


        element.addEventListener(
            "dragstart",
            event => {

                this.draggedItem =
                    String(item.id);


                document.body
                    .classList.add(
                        "dragging-active"
                    );


                element.classList.add(
                    "dragging"
                );


                event.dataTransfer
                    .setData(
                        "text/plain",
                        String(item.id)
                    );


                event.dataTransfer
                    .effectAllowed =
                    "move";

            }
        );


        element.addEventListener(
            "dragend",
            () => {

                this.draggedItem =
                    null;


                document.body
                    .classList.remove(
                        "dragging-active"
                    );


                element.classList.remove(
                    "dragging"
                );

            }
        );


        return element;

    }


    /*
    ======================================================
    MATCHING
    ======================================================
    */

    renderMatching(question) {

        const data =
            question.getMatching();


        const container =
            this.elements
                .answerContainer;


        if (
            !data ||
            !container
        ) {

            return;

        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "matching-container";


        const leftColumn =
            document.createElement(
                "div"
            );


        leftColumn.className =
            "matching-column";


        const rightColumn =
            document.createElement(
                "div"
            );


        rightColumn.className =
            "matching-column";


        const leftItems =
            Array.isArray(data.left)
                ? data.left
                : [];


        const rightItems =
            Array.isArray(data.right)
                ? data.right
                : [];


        const userMap =
            question.getUserMatching();


        /*
        Esquerda
        */

        leftItems.forEach(
            (item, index) => {

                const element =
                    this.createMatchingItem(
                        item,
                        "left",
                        index
                    );


                const id =
                    String(item.id);


                if (
                    Object.prototype
                        .hasOwnProperty.call(
                            userMap,
                            id
                        )
                ) {

                    element.classList.add(
                        "matched"
                    );

                }


                element.addEventListener(
                    "click",
                    () => {

                        this.handleMatchingClick(
                            question,
                            "left",
                            id
                        );

                    }
                );


                leftColumn.appendChild(
                    element
                );

            }
        );


        /*
        Direita
        */

        const matchedRight =
            new Set(
                Object.values(
                    userMap
                ).map(String)
            );


        rightItems.forEach(
            (item, index) => {

                const element =
                    this.createMatchingItem(
                        item,
                        "right",
                        index
                    );


                const id =
                    String(item.id);


                if (
                    matchedRight.has(id)
                ) {

                    element.classList.add(
                        "matched"
                    );

                }


                element.addEventListener(
                    "click",
                    () => {

                        this.handleMatchingClick(
                            question,
                            "right",
                            id
                        );

                    }
                );


                rightColumn.appendChild(
                    element
                );

            }
        );


        wrapper.appendChild(
            leftColumn
        );

        wrapper.appendChild(
            rightColumn
        );


        container.appendChild(
            wrapper
        );

    }


    /*
    ======================================================
    ITEM MATCHING
    ======================================================
    */

    createMatchingItem(
        item,
        side,
        index
    ) {

        const element =
            document.createElement(
                "div"
            );


        element.className =
            "matching-item";

        element.dataset.side =
            side;

        element.dataset.id =
            String(item.id);


        const number =
            document.createElement(
                "span"
            );


        number.className =
            "matching-pair-number";

        number.textContent =
            index + 1;


        const text =
            document.createElement(
                "span"
            );


        text.innerHTML =
            this.formatText(
                item.text ||
                item.label ||
                String(item.id)
            );


        element.appendChild(
            number
        );

        element.appendChild(
            text
        );


        return element;

    }


    /*
    ======================================================
    CLIQUE MATCHING
    ======================================================
    */

    handleMatchingClick(
        question,
        side,
        id
    ) {

        if (!this.engine) {

            return;

        }


        if (side === "left") {

            this.matchingSelection.left =
                id;

        } else {

            this.matchingSelection.right =
                id;

        }


        /*
        Quando temos os dois lados,
        registra o par.
        */

        if (
            this.matchingSelection.left &&
            this.matchingSelection.right
        ) {

            this.engine
                .setMatchingAnswer(
                    this.matchingSelection.left,
                    this.matchingSelection.right
                );


            this.matchingSelection = {
                left: null,
                right: null
            };


            this.render(
                this.engine
                    .getCurrentQuestion()
            );


            return;

        }


        /*
        Atualiza visual da seleção
        temporária.
        */

        document
            .querySelectorAll(
                ".matching-item"
            )
            .forEach(
                element => {

                    element.classList.remove(
                        "selected"
                    );


                    const elementSide =
                        element.dataset.side;


                    const elementId =
                        element.dataset.id;


                    if (
                        elementSide ===
                            "left" &&
                        elementId ===
                            this.matchingSelection.left
                    ) {

                        element.classList.add(
                            "selected"
                        );

                    }


                    if (
                        elementSide ===
                            "right" &&
                        elementId ===
                            this.matchingSelection.right
                    ) {

                        element.classList.add(
                            "selected"
                        );

                    }

                }
            );

    }


    /*
    ======================================================
    ORDERING
    ======================================================
    */

    renderOrdering(question) {

        const data =
            question.getOrdering();


        const container =
            this.elements
                .answerContainer;


        if (
            !data ||
            !container
        ) {

            return;

        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "ordering-container";


        const items =
            Array.isArray(data.items)
                ? data.items
                : [];


        let order =
            question.getUserOrder();


        /*
        Se ainda não existe ordem do usuário,
        utiliza a ordem apresentada no banco.
        */

        if (
            order.length === 0
        ) {

            order =
                items.map(
                    item =>
                        String(item.id)
                );


            question.setOrder(
                order
            );

        }


        order.forEach(
            (itemId, index) => {

                const item =
                    items.find(
                        candidate =>
                            String(
                                candidate.id
                            ) ===
                            String(itemId)
                    );


                if (!item) {

                    return;

                }


                const element =
                    document.createElement(
                        "div"
                    );


                element.className =
                    "order-item";

                element.draggable =
                    true;

                element.dataset.index =
                    String(index);


                /*
                Posição
                */

                const position =
                    document.createElement(
                        "div"
                    );


                position.className =
                    "order-position";

                position.textContent =
                    index + 1;


                /*
                Texto
                */

                const text =
                    document.createElement(
                        "div"
                    );


                text.className =
                    "order-text";

                text.innerHTML =
                    this.formatText(
                        item.text ||
                        item.label ||
                        itemId
                    );


                /*
                Controles
                */

                const controls =
                    document.createElement(
                        "div"
                    );


                controls.className =
                    "order-controls";


                const up =
                    document.createElement(
                        "button"
                    );


                up.type =
                    "button";

                up.className =
                    "order-control-button";

                up.textContent =
                    "▲";

                up.disabled =
                    index === 0;


                const down =
                    document.createElement(
                        "button"
                    );


                down.type =
                    "button";

                down.className =
                    "order-control-button";

                down.textContent =
                    "▼";

                down.disabled =
                    index ===
                    order.length - 1;


                up.addEventListener(
                    "click",
                    () => {

                        if (
                            index <= 0
                        ) {

                            return;

                        }


                        this.engine
                            .moveOrderItem(
                                index,
                                index - 1
                            );


                        this.render(
                            this.engine
                                .getCurrentQuestion()
                        );

                    }
                );


                down.addEventListener(
                    "click",
                    () => {

                        if (
                            index >=
                            order.length - 1
                        ) {

                            return;

                        }


                        this.engine
                            .moveOrderItem(
                                index,
                                index + 1
                            );


                        this.render(
                            this.engine
                                .getCurrentQuestion()
                        );

                    }
                );


                controls.appendChild(
                    up
                );

                controls.appendChild(
                    down
                );


                element.appendChild(
                    position
                );

                element.appendChild(
                    text
                );

                element.appendChild(
                    controls
                );


                /*
                Drag start
                */

                element.addEventListener(
                    "dragstart",
                    event => {

                        element.classList.add(
                            "dragging"
                        );


                        event.dataTransfer
                            .setData(
                                "text/plain",
                                String(index)
                            );

                    }
                );


                element.addEventListener(
                    "dragend",
                    () => {

                        element.classList.remove(
                            "dragging"
                        );

                    }
                );


                /*
                Drop
                */

                element.addEventListener(
                    "dragover",
                    event => {

                        event.preventDefault();

                    }
                );


                element.addEventListener(
                    "drop",
                    event => {

                        event.preventDefault();


                        const from =
                            Number(
                                event.dataTransfer
                                    .getData(
                                        "text/plain"
                                    )
                            );


                        const to =
                            index;


                        if (
                            !Number.isInteger(from)
                        ) {

                            return;

                        }


                        this.engine
                            .moveOrderItem(
                                from,
                                to
                            );


                        this.render(
                            this.engine
                                .getCurrentQuestion()
                        );

                    }
                );


                wrapper.appendChild(
                    element
                );

            }
        );


        container.appendChild(
            wrapper
        );

    }


    /*
    ======================================================
    LAB
    ======================================================
    */

    renderLab(question) {

        if (
            this.labRenderer &&
            typeof this.labRenderer.render ===
                "function"
        ) {

            this.labRenderer.render(
                question
            );

            return;

        }


        const container =
            this.elements
                .answerContainer;


        if (!container) {

            return;

        }


        const warning =
            document.createElement(
                "div"
            );


        warning.className =
            "empty-state";


        warning.innerHTML =
            "<strong>Lab question</strong><span>LabRenderer is not available.</span>";


        container.appendChild(
            warning
        );

    }


    /*
    ======================================================
    TABELA
    ======================================================
    */

    createTable(
        headers,
        rows,
        container
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "exhibit-table-wrapper";


        const table =
            document.createElement(
                "table"
            );


        table.className =
            "exhibit-table";


        const thead =
            document.createElement(
                "thead"
            );


        const headerRow =
            document.createElement(
                "tr"
            );


        headers.forEach(
            header => {

                const th =
                    document.createElement(
                        "th"
                    );


                th.textContent =
                    header;


                headerRow.appendChild(
                    th
                );

            }
        );


        thead.appendChild(
            headerRow
        );


        const tbody =
            document.createElement(
                "tbody"
            );


        rows.forEach(row => {

            const tr =
                document.createElement(
                    "tr"
                );


            row.forEach(cell => {

                const td =
                    document.createElement(
                        "td"
                    );


                td.innerHTML =
                    this.formatText(
                        cell
                    );


                tr.appendChild(
                    td
                );

            });


            tbody.appendChild(
                tr
            );

        });


        table.appendChild(
            thead
        );

        table.appendChild(
            tbody
        );


        wrapper.appendChild(
            table
        );


        container.appendChild(
            wrapper
        );

    }


    /*
    ======================================================
    CODE BLOCK
    ======================================================
    */

    createCodeBlock(
        code,
        container,
        title = "Output"
    ) {

        const block =
            document.createElement(
                "div"
            );


        block.className =
            "code-block";


        const header =
            document.createElement(
                "div"
            );


        header.className =
            "code-block-header";

        header.textContent =
            title;


        const pre =
            document.createElement(
                "pre"
            );


        pre.textContent =
            code || "";


        block.appendChild(
            header
        );

        block.appendChild(
            pre
        );


        container.appendChild(
            block
        );

    }


    /*
    ======================================================
    QUESTÃO NÃO SUPORTADA
    ======================================================
    */

    renderUnsupported(question) {

        const container =
            this.elements
                .answerContainer;


        if (!container) {

            return;

        }


        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "empty-state";


        empty.innerHTML =
            `<strong>Unsupported question type</strong>
             <span>${this.escapeHTML(
                 question.getType()
             )}</span>`;


        container.appendChild(
            empty
        );

    }


    /*
    ======================================================
    SEM QUESTÃO
    ======================================================
    */

    renderEmpty() {

        this.clear();


        if (
            this.elements.questionText
        ) {

            this.elements
                .questionText
                .textContent =
                "No question available.";

        }

    }


    /*
    ======================================================
    INSTRUÇÕES PADRÃO
    ======================================================
    */

    getDefaultInstruction(question) {

        switch (
            question.getType()
        ) {

            case "single":

                return "Select one answer.";


            case "multiple":

                return "Select all answers that apply.";


            case "dragdrop":

                return "Drag each option to the correct target.";


            case "matching":

                return "Match each item with the correct option.";


            case "ordering":

                return "Place the items in the correct order.";


            case "exhibit":

                return "Refer to the exhibit. Select the best answer.";


            case "cli":

                return "Refer to the command output. Select the best answer.";


            case "lab":

                return "Complete the required configuration tasks.";


            default:

                return "";

        }

    }


    /*
    ======================================================
    LABEL DO TIPO
    ======================================================
    */

    getTypeLabel(type) {

        const labels = {

            single:
                "Single Choice",

            multiple:
                "Multiple Choice",

            dragdrop:
                "Drag & Drop",

            matching:
                "Matching",

            ordering:
                "Ordering",

            exhibit:
                "Exhibit",

            cli:
                "CLI",

            lab:
                "Configuration Lab"

        };


        return (
            labels[type] ||
            type
        );

    }


    /*
    ======================================================
    LETRA
    ======================================================
    */

    indexToLetter(index) {

        return String.fromCharCode(
            65 + index
        );

    }


    /*
    ======================================================
    FORMATAÇÃO SEGURA
    ======================================================
    */

    formatText(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }


        let text =
            this.escapeHTML(
                String(value)
            );


        /*
        Quebras de linha
        */

        text =
            text.replace(
                /\n/g,
                "<br>"
            );


        /*
        Código inline simples:

        `show ip route`
        */

        text =
            text.replace(
                /`([^`]+)`/g,
                "<code>$1</code>"
            );


        return text;

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

window.QuestionRenderer =
    QuestionRenderer;
