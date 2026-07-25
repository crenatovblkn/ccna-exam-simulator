/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
LabRenderer

Responsabilidade:
- Renderizar questões do tipo LAB
- Exibir cenário e tarefas
- Criar terminal Cisco simulado
- Receber comandos do aluno
- Manter histórico de comandos
- Atualizar estado do laboratório
- Restaurar o laboratório ao navegar entre questões
- NÃO calcular a pontuação final
==========================================================
*/

class LabRenderer {

    constructor(options = {}) {

        this.engine =
            options.engine || null;

        this.container =
            options.container || null;

        this.currentQuestion =
            null;

        this.commandHistory = [];

        this.historyIndex = 0;

        this.cliMode = "exec";

        this.prompt = "Router>";

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
    RENDER
    ======================================================
    */

    render(question) {

        if (!question) {

            return;

        }


        this.currentQuestion =
            question;


        if (!this.container) {

            this.container =
                document.getElementById(
                    "answerContainer"
                );

        }


        if (!this.container) {

            return;

        }


        this.container.innerHTML = "";


        const lab =
            question.getLab();


        if (!lab) {

            this.renderError(
                "Lab data is not available."
            );

            return;

        }


        /*
        --------------------------------------------------
        Restaura estado salvo
        --------------------------------------------------
        */

        const savedState =
            question.getUserLabState
                ? question.getUserLabState()
                : {};


        this.commandHistory =
            Array.isArray(
                savedState.commandHistory
            )
                ? [
                    ...savedState.commandHistory
                ]
                : [];


        this.historyIndex =
            this.commandHistory.length;


        this.cliMode =
            savedState.cliMode ||
            "exec";


        this.prompt =
            savedState.prompt ||
            lab.prompt ||
            "Router>";


        /*
        --------------------------------------------------
        Wrapper
        --------------------------------------------------
        */

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "lab-container";


        /*
        --------------------------------------------------
        Painel de instruções
        --------------------------------------------------
        */

        wrapper.appendChild(
            this.createInstructionsPanel(
                lab
            )
        );


        /*
        --------------------------------------------------
        Área principal
        --------------------------------------------------
        */

        const workspace =
            document.createElement(
                "div"
            );


        workspace.className =
            "lab-workspace";


        /*
        Topologia / cenário
        */

        const scenario =
            this.createScenarioPanel(
                lab
            );


        if (scenario) {

            workspace.appendChild(
                scenario
            );

        }


        /*
        Terminal
        */

        workspace.appendChild(
            this.createTerminal(
                lab,
                savedState
            )
        );


        wrapper.appendChild(
            workspace
        );


        this.container.appendChild(
            wrapper
        );

    }


    /*
    ======================================================
    INSTRUÇÕES DO LAB
    ======================================================
    */

    createInstructionsPanel(lab) {

        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "lab-instructions";


        /*
        Título
        */

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "lab-instructions-header";


        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            lab.title ||
            "Configuration Lab";


        header.appendChild(
            title
        );


        panel.appendChild(
            header
        );


        /*
        Descrição
        */

        if (lab.description) {

            const description =
                document.createElement(
                    "div"
                );


            description.className =
                "lab-description";


            description.innerHTML =
                this.formatText(
                    lab.description
                );


            panel.appendChild(
                description
            );

        }


        /*
        Tarefas
        */

        if (
            Array.isArray(
                lab.tasks
            ) &&
            lab.tasks.length > 0
        ) {

            const tasksTitle =
                document.createElement(
                    "h4"
                );


            tasksTitle.textContent =
                "Tasks";


            panel.appendChild(
                tasksTitle
            );


            const list =
                document.createElement(
                    "ol"
                );


            list.className =
                "lab-task-list";


            lab.tasks.forEach(
                task => {

                    const item =
                        document.createElement(
                            "li"
                        );


                    if (
                        typeof task ===
                        "string"
                    ) {

                        item.innerHTML =
                            this.formatText(
                                task
                            );

                    } else {

                        item.innerHTML =
                            this.formatText(
                                task.text ||
                                task.description ||
                                ""
                            );

                    }


                    list.appendChild(
                        item
                    );

                }
            );


            panel.appendChild(
                list
            );

        }


        return panel;

    }


    /*
    ======================================================
    CENÁRIO / TOPOLOGIA
    ======================================================
    */

    createScenarioPanel(lab) {

        if (
            !lab.topology &&
            !lab.image &&
            !lab.scenario
        ) {

            return null;

        }


        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "lab-scenario";


        const title =
            document.createElement(
                "div"
            );


        title.className =
            "lab-panel-title";

        title.textContent =
            "Topology / Scenario";


        panel.appendChild(
            title
        );


        /*
        Imagem
        */

        const imageSource =
            lab.image ||
            (
                lab.topology &&
                lab.topology.image
                    ? lab.topology.image
                    : null
            );


        if (imageSource) {

            const imageWrapper =
                document.createElement(
                    "div"
                );


            imageWrapper.className =
                "lab-topology-image";


            const image =
                document.createElement(
                    "img"
                );


            image.src =
                imageSource;

            image.alt =
                "Network topology";

            image.loading =
                "lazy";


            imageWrapper.appendChild(
                image
            );


            panel.appendChild(
                imageWrapper
            );

        }


        /*
        Texto do cenário
        */

        if (lab.scenario) {

            const scenario =
                document.createElement(
                    "div"
                );


            scenario.className =
                "lab-scenario-text";


            scenario.innerHTML =
                this.formatText(
                    lab.scenario
                );


            panel.appendChild(
                scenario
            );

        }


        /*
        Tabela de endereçamento
        */

        const addressing =
            lab.addressingTable ||
            (
                lab.topology
                    ? lab.topology
                        .addressingTable
                    : null
            );


        if (
            Array.isArray(addressing) &&
            addressing.length > 0
        ) {

            panel.appendChild(
                this.createAddressingTable(
                    addressing
                )
            );

        }


        return panel;

    }


    /*
    ======================================================
    TABELA DE ENDEREÇAMENTO
    ======================================================
    */

    createAddressingTable(data) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "lab-addressing-wrapper";


        const table =
            document.createElement(
                "table"
            );


        table.className =
            "lab-addressing-table";


        /*
        Detecta colunas automaticamente.
        */

        const columns =
            Object.keys(
                data[0] || {}
            );


        if (
            columns.length === 0
        ) {

            return wrapper;

        }


        const thead =
            document.createElement(
                "thead"
            );


        const headerRow =
            document.createElement(
                "tr"
            );


        columns.forEach(
            column => {

                const th =
                    document.createElement(
                        "th"
                    );


                th.textContent =
                    this.formatColumnName(
                        column
                    );


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


        data.forEach(row => {

            const tr =
                document.createElement(
                    "tr"
                );


            columns.forEach(
                column => {

                    const td =
                        document.createElement(
                            "td"
                        );


                    td.textContent =
                        row[column] ??
                        "";


                    tr.appendChild(
                        td
                    );

                }
            );


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


        return wrapper;

    }


    /*
    ======================================================
    TERMINAL
    ======================================================
    */

    createTerminal(
        lab,
        savedState
    ) {

        const terminal =
            document.createElement(
                "div"
            );


        terminal.className =
            "lab-terminal";


        /*
        Header
        */

        const header =
            document.createElement(
                "div"
            );


        header.className =
            "terminal-header";


        const title =
            document.createElement(
                "span"
            );


        title.textContent =
            lab.deviceName ||
            "Cisco IOS Terminal";


        header.appendChild(
            title
        );


        /*
        Limpar terminal
        */

        const clearButton =
            document.createElement(
                "button"
            );


        clearButton.type =
            "button";

        clearButton.className =
            "terminal-clear-button";

        clearButton.textContent =
            "Clear";


        header.appendChild(
            clearButton
        );


        terminal.appendChild(
            header
        );


        /*
        Output
        */

        const output =
            document.createElement(
                "div"
            );


        output.className =
            "terminal-output";

        output.id =
            "labTerminalOutput";


        /*
        Banner inicial
        */

        if (
            savedState.terminalOutput
        ) {

            output.textContent =
                savedState.terminalOutput;

        } else {

            const banner =
                lab.banner ||
                this.getDefaultBanner();


            output.textContent =
                banner;

        }


        terminal.appendChild(
            output
        );


        /*
        Linha de entrada
        */

        const inputLine =
            document.createElement(
                "div"
            );


        inputLine.className =
            "terminal-input-line";


        const prompt =
            document.createElement(
                "span"
            );


        prompt.className =
            "terminal-prompt";

        prompt.id =
            "labTerminalPrompt";

        prompt.textContent =
            this.prompt;


        const input =
            document.createElement(
                "input"
            );


        input.type =
            "text";

        input.className =
            "terminal-input";

        input.id =
            "labTerminalInput";

        input.autocomplete =
            "off";

        input.autocapitalize =
            "off";

        input.spellcheck =
            false;


        inputLine.appendChild(
            prompt
        );

        inputLine.appendChild(
            input
        );


        terminal.appendChild(
            inputLine
        );


        /*
        Eventos
        */

        input.addEventListener(
            "keydown",
            event => {

                this.handleTerminalKey(
                    event,
                    input,
                    output,
                    prompt,
                    lab
                );

            }
        );


        clearButton.addEventListener(
            "click",
            () => {

                output.textContent =
                    "";

                this.saveState(
                    output
                );


                input.focus();

            }
        );


        terminal.addEventListener(
            "click",
            () => {

                input.focus();

            }
        );


        /*
        Mantém terminal no final.
        */

        window.requestAnimationFrame(
            () => {

                output.scrollTop =
                    output.scrollHeight;

                input.focus();

            }
        );


        return terminal;

    }


    /*
    ======================================================
    TECLADO DO TERMINAL
    ======================================================
    */

    handleTerminalKey(
        event,
        input,
        output,
        promptElement,
        lab
    ) {

        /*
        ENTER
        */

        if (
            event.key ===
            "Enter"
        ) {

            event.preventDefault();


            const command =
                input.value.trim();


            input.value = "";


            if (!command) {

                this.appendOutput(
                    output,
                    `${this.prompt}\n`
                );


                return;

            }


            this.commandHistory.push(
                command
            );


            this.historyIndex =
                this.commandHistory.length;


            /*
            Mostra comando digitado
            */

            this.appendOutput(
                output,
                `${this.prompt}${command}\n`
            );


            /*
            Processa comando
            */

            const result =
                this.processCommand(
                    command,
                    lab
                );


            if (result.output) {

                this.appendOutput(
                    output,
                    `${result.output}\n`
                );

            }


            if (result.prompt) {

                this.prompt =
                    result.prompt;


                promptElement.textContent =
                    this.prompt;

            }


            this.saveState(
                output
            );


            return;

        }


        /*
        SETA PARA CIMA
        */

        if (
            event.key ===
            "ArrowUp"
        ) {

            event.preventDefault();


            if (
                this.commandHistory
                    .length === 0
            ) {

                return;

            }


            this.historyIndex =
                Math.max(
                    0,
                    this.historyIndex - 1
                );


            input.value =
                this.commandHistory[
                    this.historyIndex
                ] || "";


            this.moveCursorToEnd(
                input
            );


            return;

        }


        /*
        SETA PARA BAIXO
        */

        if (
            event.key ===
            "ArrowDown"
        ) {

            event.preventDefault();


            if (
                this.commandHistory
                    .length === 0
            ) {

                return;

            }


            this.historyIndex =
                Math.min(
                    this.commandHistory
                        .length,
                    this.historyIndex + 1
                );


            if (
                this.historyIndex >=
                this.commandHistory.length
            ) {

                input.value = "";

            } else {

                input.value =
                    this.commandHistory[
                        this.historyIndex
                    ];

            }


            this.moveCursorToEnd(
                input
            );

        }

    }


    /*
    ======================================================
    PROCESSADOR DE COMANDOS
    ======================================================
    */

    processCommand(
        command,
        lab
    ) {

        const normalized =
            command
                .trim()
                .replace(
                    /\s+/g,
                    " "
                );


        const lower =
            normalized
                .toLowerCase();


        /*
        --------------------------------------------------
        Comandos customizados definidos na questão.

        lab.commands pode possuir:

        {
            "show ip interface brief": {
                output: "...",
                prompt: "R1#"
            }
        }
        --------------------------------------------------
        */

        if (
            lab.commands &&
            typeof lab.commands ===
            "object"
        ) {

            const custom =
                this.findCustomCommand(
                    lower,
                    lab.commands
                );


            if (custom) {

                return this.executeCustomCommand(
                    custom
                );

            }

        }


        /*
        --------------------------------------------------
        ENABLE
        --------------------------------------------------
        */

        if (
            lower === "enable" ||
            lower === "en"
        ) {

            this.cliMode =
                "privileged";


            return {

                output:
                    "",

                prompt:
                    this.replacePromptSuffix(
                        "#"
                    )

            };

        }


        /*
        --------------------------------------------------
        DISABLE
        --------------------------------------------------
        */

        if (
            lower === "disable"
        ) {

            this.cliMode =
                "exec";


            return {

                output:
                    "",

                prompt:
                    this.replacePromptSuffix(
                        ">"
                    )

            };

        }


        /*
        --------------------------------------------------
        CONFIGURE TERMINAL
        --------------------------------------------------
        */

        if (
            lower ===
                "configure terminal" ||
            lower ===
                "conf t" ||
            lower ===
                "configure t"
        ) {

            if (
                this.cliMode !==
                "privileged"
            ) {

                return {

                    output:
                        "% Invalid input detected at '^' marker.",

                    prompt:
                        this.prompt

                };

            }


            this.cliMode =
                "config";


            return {

                output:
                    "Enter configuration commands, one per line. End with CNTL/Z.",

                prompt:
                    this.getHostname() +
                    "(config)#"

            };

        }


        /*
        --------------------------------------------------
        INTERFACE
        --------------------------------------------------
        */

        if (
            this.cliMode ===
                "config" &&
            lower.startsWith(
                "interface "
            )
        ) {

            const interfaceName =
                normalized.substring(
                    normalized.indexOf(" ") + 1
                );


            this.cliMode =
                "config-if";


            this.setTemporaryState(
                "currentInterface",
                interfaceName
            );


            return {

                output:
                    "",

                prompt:
                    this.getHostname() +
                    "(config-if)#"

            };

        }


        /*
        --------------------------------------------------
        ROUTER
        --------------------------------------------------
        */

        if (
            this.cliMode ===
                "config" &&
            lower.startsWith(
                "router "
            )
        ) {

            const protocol =
                normalized.substring(
                    normalized.indexOf(" ") + 1
                );


            this.cliMode =
                "config-router";


            this.setTemporaryState(
                "routingProtocol",
                protocol
            );


            return {

                output:
                    "",

                prompt:
                    this.getHostname() +
                    "(config-router)#"

            };

        }


        /*
        --------------------------------------------------
        LINE
        --------------------------------------------------
        */

        if (
            this.cliMode ===
                "config" &&
            lower.startsWith(
                "line "
            )
        ) {

            this.cliMode =
                "config-line";


            return {

                output:
                    "",

                prompt:
                    this.getHostname() +
                    "(config-line)#"

            };

        }


        /*
        --------------------------------------------------
        EXIT
        --------------------------------------------------
        */

        if (
            lower === "exit"
        ) {

            return this.processExit();

        }


        /*
        --------------------------------------------------
        END / CTRL-Z equivalente
        --------------------------------------------------
        */

        if (
            lower === "end"
        ) {

            this.cliMode =
                "privileged";


            return {

                output:
                    "",

                prompt:
                    this.getHostname() +
                    "#"

            };

        }


        /*
        --------------------------------------------------
        HOSTNAME
        --------------------------------------------------
        */

        if (
            this.cliMode ===
                "config" &&
            lower.startsWith(
                "hostname "
            )
        ) {

            const hostname =
                normalized.substring(
                    normalized.indexOf(" ") + 1
                ).trim();


            if (!hostname) {

                return {

                    output:
                        "% Incomplete command.",

                    prompt:
                        this.prompt

                };

            }


            this.setTemporaryState(
                "hostname",
                hostname
            );


            return {

                output:
                    "",

                prompt:
                    hostname +
                    "(config)#"

            };

        }


        /*
        --------------------------------------------------
        Configurações comuns

        São registradas no estado do laboratório.
        --------------------------------------------------
        */

        if (
            this.cliMode ===
                "config" ||
            this.cliMode ===
                "config-if" ||
            this.cliMode ===
                "config-router" ||
            this.cliMode ===
                "config-line"
        ) {

            this.recordConfigurationCommand(
                normalized
            );


            return {

                output:
                    "",

                prompt:
                    this.prompt

            };

        }


        /*
        --------------------------------------------------
        SHOW RUNNING-CONFIG
        --------------------------------------------------
        */

        if (
            lower ===
                "show running-config" ||
            lower ===
                "show run" ||
            lower ===
                "sh run"
        ) {

            return {

                output:
                    this.generateRunningConfig(
                        lab
                    ),

                prompt:
                    this.prompt

            };

        }


        /*
        --------------------------------------------------
        SHOW HISTORY
        --------------------------------------------------
        */

        if (
            lower ===
                "show history" ||
            lower ===
                "sh history"
        ) {

            return {

                output:
                    this.commandHistory
                        .join("\n"),

                prompt:
                    this.prompt

            };

        }


        /*
        --------------------------------------------------
        HELP
        --------------------------------------------------
        */

        if (
            lower === "?" ||
            lower === "help"
        ) {

            return {

                output:
                    this.getHelpText(),

                prompt:
                    this.prompt

            };

        }


        /*
        --------------------------------------------------
        Comando desconhecido
        --------------------------------------------------
        */

        return {

            output:
                "% Invalid input detected at '^' marker.",

            prompt:
                this.prompt

        };

    }


    /*
    ======================================================
    COMANDO CUSTOMIZADO
    ======================================================
    */

    findCustomCommand(
        command,
        commands
    ) {

        const keys =
            Object.keys(
                commands
            );


        /*
        Correspondência exata.
        */

        const exact =
            keys.find(
                key =>
                    key.toLowerCase() ===
                    command
            );


        if (exact) {

            return commands[exact];

        }


        /*
        Aliases.
        */

        for (
            const key of keys
        ) {

            const item =
                commands[key];


            if (
                item &&
                Array.isArray(
                    item.aliases
                )
            ) {

                const match =
                    item.aliases.some(
                        alias =>
                            String(alias)
                                .toLowerCase() ===
                            command
                    );


                if (match) {

                    return item;

                }

            }

        }


        return null;

    }


    /*
    ======================================================
    EXECUTA COMANDO CUSTOMIZADO
    ======================================================
    */

    executeCustomCommand(
        custom
    ) {

        if (
            typeof custom ===
            "string"
        ) {

            return {

                output:
                    custom,

                prompt:
                    this.prompt

            };

        }


        if (
            !custom ||
            typeof custom !==
            "object"
        ) {

            return {

                output:
                    "",

                prompt:
                    this.prompt

            };

        }


        if (custom.mode) {

            this.cliMode =
                custom.mode;

        }


        return {

            output:
                custom.output ||
                "",

            prompt:
                custom.prompt ||
                this.prompt

        };

    }


    /*
    ======================================================
    EXIT
    ======================================================
    */

    processExit() {

        switch (
            this.cliMode
        ) {

            case "config-if":

            case "config-router":

            case "config-line":

                this.cliMode =
                    "config";


                return {

                    output:
                        "",

                    prompt:
                        this.getHostname() +
                        "(config)#"

                };


            case "config":

                this.cliMode =
                    "privileged";


                return {

                    output:
                        "",

                    prompt:
                        this.getHostname() +
                        "#"

                };


            case "privileged":

                this.cliMode =
                    "exec";


                return {

                    output:
                        "",

                    prompt:
                        this.getHostname() +
                        ">"

                };


            default:

                return {

                    output:
                        "",

                    prompt:
                        this.prompt

                };

        }

    }


    /*
    ======================================================
    REGISTRA CONFIGURAÇÃO
    ======================================================
    */

    recordConfigurationCommand(
        command
    ) {

        if (
            !this.currentQuestion
        ) {

            return;

        }


        const state =
            this.getCurrentLabState();


        if (
            !Array.isArray(
                state.configurationCommands
            )
        ) {

            state.configurationCommands =
                [];

        }


        state.configurationCommands.push({

            mode:
                this.cliMode,

            interface:
                state.currentInterface ||
                null,

            command:
                command

        });


        this.updateQuestionState(
            state
        );

    }


    /*
    ======================================================
    RUNNING CONFIG SIMPLIFICADO
    ======================================================
    */

    generateRunningConfig(lab) {

        const state =
            this.getCurrentLabState();


        const hostname =
            state.hostname ||
            lab.hostname ||
            "Router";


        const lines = [

            "Building configuration...",
            "",
            "Current configuration :",
            "!",
            `hostname ${hostname}`,
            "!"

        ];


        const commands =
            Array.isArray(
                state.configurationCommands
            )
                ? state.configurationCommands
                : [];


        commands.forEach(
            entry => {

                lines.push(
                    entry.command
                );

            }
        );


        lines.push(
            "!",
            "end"
        );


        return lines.join(
            "\n"
        );

    }


    /*
    ======================================================
    ESTADO TEMPORÁRIO
    ======================================================
    */

    setTemporaryState(
        key,
        value
    ) {

        const state =
            this.getCurrentLabState();


        state[key] =
            value;


        this.updateQuestionState(
            state
        );

    }


    /*
    ======================================================
    ESTADO ATUAL
    ======================================================
    */

    getCurrentLabState() {

        if (
            !this.currentQuestion
        ) {

            return {};

        }


        if (
            typeof this.currentQuestion
                .getUserLabState ===
                "function"
        ) {

            const state =
                this.currentQuestion
                    .getUserLabState();


            if (
                state &&
                typeof state ===
                "object"
            ) {

                return {
                    ...state
                };

            }

        }


        return {};

    }


    /*
    ======================================================
    ATUALIZA QUESTION
    ======================================================
    */

    updateQuestionState(state) {

        if (
            !this.currentQuestion
        ) {

            return false;

        }


        if (
            this.engine &&
            typeof this.engine
                .setLabState ===
                "function"
        ) {

            return this.engine
                .setLabState(
                    state
                );

        }


        if (
            typeof this.currentQuestion
                .setLabState ===
                "function"
        ) {

            return this.currentQuestion
                .setLabState(
                    state
                );

        }


        return false;

    }


    /*
    ======================================================
    SALVAR ESTADO
    ======================================================
    */

    saveState(output) {

        const state =
            this.getCurrentLabState();


        state.commandHistory =
            [
                ...this.commandHistory
            ];


        state.cliMode =
            this.cliMode;


        state.prompt =
            this.prompt;


        state.terminalOutput =
            output.textContent;


        this.updateQuestionState(
            state
        );

    }


    /*
    ======================================================
    HOSTNAME
    ======================================================
    */

    getHostname() {

        const state =
            this.getCurrentLabState();


        if (state.hostname) {

            return state.hostname;

        }


        const prompt =
            this.prompt || "";


        const hostname =
            prompt.split(
                /[>(#]/
            )[0];


        return (
            hostname ||
            "Router"
        );

    }


    /*
    ======================================================
    ALTERAR SUFIXO DO PROMPT
    ======================================================
    */

    replacePromptSuffix(
        suffix
    ) {

        return (
            this.getHostname() +
            suffix
        );

    }


    /*
    ======================================================
    OUTPUT
    ======================================================
    */

    appendOutput(
        output,
        text
    ) {

        output.textContent +=
            text;


        output.scrollTop =
            output.scrollHeight;

    }


    /*
    ======================================================
    CURSOR
    ======================================================
    */

    moveCursorToEnd(input) {

        window.requestAnimationFrame(
            () => {

                const length =
                    input.value.length;


                input.setSelectionRange(
                    length,
                    length
                );

            }
        );

    }


    /*
    ======================================================
    BANNER
    ======================================================
    */

    getDefaultBanner() {

        return (
            "Cisco IOS Software\n" +
            "CCNA Exam Simulator\n" +
            "\n"
        );

    }


    /*
    ======================================================
    HELP
    ======================================================
    */

    getHelpText() {

        return [
            "Exec commands:",
            "  enable",
            "  disable",
            "  configure terminal",
            "  show running-config",
            "  show history",
            "  exit",
            "",
            "Configuration commands are accepted",
            "according to the current CLI mode."
        ].join("\n");

    }


    /*
    ======================================================
    FORMATA NOME DE COLUNA
    ======================================================
    */

    formatColumnName(value) {

        return String(value)
            .replace(
                /([A-Z])/g,
                " $1"
            )
            .replace(
                /[_-]/g,
                " "
            )
            .replace(
                /^\w/,
                character =>
                    character
                        .toUpperCase()
            )
            .trim();

    }


    /*
    ======================================================
    TEXTO
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


    /*
    ======================================================
    ERRO
    ======================================================
    */

    renderError(message) {

        if (!this.container) {

            return;

        }


        const error =
            document.createElement(
                "div"
            );


        error.className =
            "empty-state";


        error.innerHTML =
            `<strong>Unable to load lab</strong>
             <span>${this.escapeHTML(
                 message
             )}</span>`;


        this.container.appendChild(
            error
        );

    }


    /*
    ======================================================
    LIMPAR
    ======================================================
    */

    clear() {

        this.currentQuestion =
            null;

        this.commandHistory =
            [];

        this.historyIndex =
            0;

        this.cliMode =
            "exec";

        this.prompt =
            "Router>";


        if (this.container) {

            this.container.innerHTML =
                "";

        }

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.LabRenderer =
    LabRenderer;
