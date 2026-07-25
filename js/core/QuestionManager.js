/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
QuestionManager

Responsabilidade:
- Armazenar o banco de questões
- Validar questões carregadas
- Filtrar questões por domínio
- Filtrar por tipo e dificuldade
- Selecionar questões para o exame
- Embaralhar questões
- Evitar questões duplicadas

Este componente NÃO manipula DOM.
==========================================================
*/

class QuestionManager {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor() {

        this.questions = [];

        this.loaded = false;

        this.source = null;

    }


    /*
    ======================================================
    CARREGAR BANCO
    ======================================================
    */

    load(data = []) {

        /*
        Aceita:

        [
            {...},
            {...}
        ]

        ou

        {
            questions: [...]
        }
        */

        let questionData = data;


        if (
            data &&
            !Array.isArray(data) &&
            Array.isArray(data.questions)
        ) {

            questionData = data.questions;

        }


        if (!Array.isArray(questionData)) {

            throw new Error(
                "Invalid question bank format."
            );

        }


        const loadedQuestions = [];

        const ids = new Set();


        questionData.forEach(
            (item, index) => {

                try {

                    const question =
                        item instanceof Question
                            ? item
                            : new Question(item);


                    /*
                    --------------------------------------
                    Validação mínima
                    --------------------------------------
                    */

                    if (
                        !this.validateQuestion(
                            question
                        )
                    ) {

                        console.warn(
                            `Question ignored at index ${index}.`
                        );

                        return;

                    }


                    /*
                    --------------------------------------
                    Evita IDs duplicados
                    --------------------------------------
                    */

                    const id =
                        String(
                            question.getId()
                        );


                    if (ids.has(id)) {

                        console.warn(
                            `Duplicate question ID ignored: ${id}`
                        );

                        return;

                    }


                    ids.add(id);

                    loadedQuestions.push(
                        question
                    );

                } catch (error) {

                    console.error(
                        `Error loading question at index ${index}:`,
                        error
                    );

                }

            }
        );


        this.questions =
            loadedQuestions;


        this.loaded = true;


        return this.questions.length;

    }


    /*
    ======================================================
    CARREGAR VIA FETCH
    ======================================================

    Utilizado quando o projeto estiver sendo executado
    através de servidor web.

    Exemplo:

    await questionManager.loadFromURL(
        "data/network-fundamentals.json"
    );
    ======================================================
    */

    async loadFromURL(url) {

        if (!url) {

            throw new Error(
                "Question bank URL was not provided."
            );

        }


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `Unable to load question bank: ${response.status}`
            );

        }


        const data =
            await response.json();


        this.source = url;


        return this.load(data);

    }


    /*
    ======================================================
    CARREGAR OBJETO GLOBAL
    ======================================================

    Permite execução sem servidor web.

    O banco poderá ser carregado por:

    window.CCNA_QUESTION_BANK = {...}

    Isso evita dependência obrigatória de fetch quando
    index.html for aberto diretamente pelo navegador.
    ======================================================
    */

    loadFromGlobal(
        globalName = "CCNA_QUESTION_BANK"
    ) {

        const data =
            window[globalName];


        if (!data) {

            throw new Error(
                `Global question bank "${globalName}" was not found.`
            );

        }


        this.source =
            `window.${globalName}`;


        return this.load(data);

    }


    /*
    ======================================================
    VALIDAÇÃO
    ======================================================
    */

    validateQuestion(question) {

        if (
            !(question instanceof Question)
        ) {

            return false;

        }


        /*
        ID obrigatório
        */

        if (!question.getId()) {

            return false;

        }


        /*
        Enunciado obrigatório
        */

        if (
            !question.getQuestion() ||
            !String(
                question.getQuestion()
            ).trim()
        ) {

            return false;

        }


        /*
        Tipo válido
        */

        const validTypes = [

            "single",
            "multiple",
            "dragdrop",
            "matching",
            "ordering",
            "exhibit",
            "cli",
            "lab"

        ];


        if (
            !validTypes.includes(
                question.getType()
            )
        ) {

            return false;

        }


        /*
        Questões objetivas precisam
        possuir alternativas.
        */

        const choiceTypes = [

            "single",
            "multiple",
            "exhibit",
            "cli"

        ];


        if (
            choiceTypes.includes(
                question.getType()
            )
        ) {

            if (
                !Array.isArray(
                    question.getAnswers()
                ) ||
                question.getAnswers().length < 2
            ) {

                return false;

            }


            if (
                question
                    .getCorrectAnswers()
                    .length === 0
            ) {

                return false;

            }

        }


        /*
        Single deve possuir somente
        uma resposta correta.
        */

        if (
            question.getType() ===
                "single" &&
            question
                .getCorrectAnswers()
                .length !== 1
        ) {

            return false;

        }


        /*
        Multiple precisa de pelo menos
        duas respostas corretas.
        */

        if (
            question.getType() ===
                "multiple" &&
            question
                .getCorrectAnswers()
                .length < 2
        ) {

            return false;

        }


        /*
        Drag and Drop
        */

        if (
            question.getType() ===
            "dragdrop"
        ) {

            const dragdrop =
                question.getDragdrop();


            if (
                !dragdrop ||
                typeof dragdrop !==
                    "object"
            ) {

                return false;

            }

        }


        /*
        Matching
        */

        if (
            question.getType() ===
            "matching"
        ) {

            const matching =
                question.getMatching();


            if (
                !matching ||
                typeof matching !==
                    "object"
            ) {

                return false;

            }

        }


        /*
        Ordering
        */

        if (
            question.getType() ===
            "ordering"
        ) {

            const ordering =
                question.getOrdering();


            if (
                !ordering ||
                typeof ordering !==
                    "object"
            ) {

                return false;

            }

        }


        /*
        LAB
        */

        if (
            question.getType() ===
            "lab"
        ) {

            const lab =
                question.getLab();


            if (
                !lab ||
                typeof lab !==
                    "object"
            ) {

                return false;

            }

        }


        return true;

    }


    /*
    ======================================================
    ESTADO
    ======================================================
    */

    isLoaded() {

        return this.loaded;

    }


    getSource() {

        return this.source;

    }


    /*
    ======================================================
    TODAS AS QUESTÕES
    ======================================================
    */

    getAll() {

        return [...this.questions];

    }


    /*
    ======================================================
    TOTAL
    ======================================================
    */

    getCount() {

        return this.questions.length;

    }


    /*
    ======================================================
    BUSCAR POR ID
    ======================================================
    */

    getById(id) {

        id = String(id);


        return (
            this.questions.find(
                question =>
                    String(
                        question.getId()
                    ) === id
            ) || null
        );

    }


    /*
    ======================================================
    DOMÍNIOS DISPONÍVEIS
    ======================================================
    */

    getDomains() {

        const domains =
            new Set();


        this.questions.forEach(
            question => {

                if (
                    question.getDomain()
                ) {

                    domains.add(
                        question.getDomain()
                    );

                }

            }
        );


        return Array.from(domains);

    }


    /*
    ======================================================
    TIPOS DISPONÍVEIS
    ======================================================
    */

    getTypes() {

        const types =
            new Set();


        this.questions.forEach(
            question => {

                types.add(
                    question.getType()
                );

            }
        );


        return Array.from(types);

    }


    /*
    ======================================================
    DIFICULDADES DISPONÍVEIS
    ======================================================
    */

    getDifficulties() {

        const difficulties =
            new Set();


        this.questions.forEach(
            question => {

                difficulties.add(
                    question.getDifficulty()
                );

            }
        );


        return Array.from(
            difficulties
        );

    }


    /*
    ======================================================
    FILTRO POR DOMÍNIO
    ======================================================
    */

    filterByDomain(domain) {

        if (!domain) {

            return this.getAll();

        }


        const normalized =
            String(domain)
                .trim()
                .toLowerCase();


        return this.questions.filter(
            question =>

                String(
                    question.getDomain()
                )
                    .trim()
                    .toLowerCase() ===
                normalized

        );

    }


    /*
    ======================================================
    FILTRO POR TIPO
    ======================================================
    */

    filterByType(type) {

        if (!type) {

            return this.getAll();

        }


        const normalized =
            String(type)
                .trim()
                .toLowerCase();


        return this.questions.filter(
            question =>

                String(
                    question.getType()
                )
                    .trim()
                    .toLowerCase() ===
                normalized

        );

    }


    /*
    ======================================================
    FILTRO POR DIFICULDADE
    ======================================================
    */

    filterByDifficulty(
        difficulty
    ) {

        if (!difficulty) {

            return this.getAll();

        }


        const normalized =
            String(difficulty)
                .trim()
                .toLowerCase();


        return this.questions.filter(
            question =>

                String(
                    question.getDifficulty()
                )
                    .trim()
                    .toLowerCase() ===
                normalized

        );

    }


    /*
    ======================================================
    FILTRO COMBINADO
    ======================================================
    */

    filter(options = {}) {

        let result =
            this.getAll();


        /*
        Domínio
        */

        if (options.domain) {

            const domain =
                String(options.domain)
                    .trim()
                    .toLowerCase();


            result =
                result.filter(
                    question =>

                        String(
                            question.getDomain()
                        )
                            .trim()
                            .toLowerCase() ===
                        domain

                );

        }


        /*
        Tipo
        */

        if (options.type) {

            const types =
                Array.isArray(options.type)
                    ? options.type
                    : [options.type];


            const normalizedTypes =
                types.map(
                    type =>
                        String(type)
                            .trim()
                            .toLowerCase()
                );


            result =
                result.filter(
                    question =>
                        normalizedTypes.includes(
                            String(
                                question.getType()
                            )
                                .trim()
                                .toLowerCase()
                        )
                );

        }


        /*
        Dificuldade
        */

        if (options.difficulty) {

            const difficulties =
                Array.isArray(
                    options.difficulty
                )
                    ? options.difficulty
                    : [
                        options.difficulty
                    ];


            const normalized =
                difficulties.map(
                    difficulty =>
                        String(difficulty)
                            .trim()
                            .toLowerCase()
                );


            result =
                result.filter(
                    question =>
                        normalized.includes(
                            String(
                                question
                                    .getDifficulty()
                            )
                                .trim()
                                .toLowerCase()
                        )
                );

        }


        /*
        IDs específicos
        */

        if (
            Array.isArray(
                options.ids
            ) &&
            options.ids.length > 0
        ) {

            const ids =
                options.ids.map(String);


            result =
                result.filter(
                    question =>
                        ids.includes(
                            String(
                                question.getId()
                            )
                        )
                );

        }


        return result;

    }


    /*
    ======================================================
    SELECIONAR QUESTÕES
    ======================================================

    Exemplo:

    selectQuestions({
        domain: "Network Fundamentals",
        count: 90,
        shuffle: true
    });
    ======================================================
    */

    selectQuestions(
        options = {}
    ) {

        const count =
            Number.isInteger(
                options.count
            )
                ? options.count
                : this.questions.length;


        const shouldShuffle =
            options.shuffle !== false;


        /*
        Aplica filtros
        */

        let pool =
            this.filter(options);


        /*
        Clona array para não modificar
        o banco original.
        */

        pool =
            [...pool];


        /*
        Embaralha
        */

        if (shouldShuffle) {

            pool =
                this.shuffle(pool);

        }


        /*
        Limita quantidade
        */

        const limit =
            Math.max(
                0,
                Math.min(
                    count,
                    pool.length
                )
            );


        const selected =
            pool.slice(
                0,
                limit
            );


        /*
        Cada exame recebe clones das
        questões.

        Isso impede que respostas de
        uma sessão alterem o banco.
        */

        return selected.map(
            question =>
                question.clone()
        );

    }


    /*
    ======================================================
    SELEÇÃO BALANCEADA POR TIPO
    ======================================================

    Permite criar exames com distribuição
    definida de questões.

    Exemplo:

    {
        single: 60,
        multiple: 15,
        exhibit: 5,
        dragdrop: 4,
        matching: 2,
        ordering: 2,
        lab: 2
    }
    ======================================================
    */

    selectBalanced(
        distribution = {},
        options = {}
    ) {

        const selected = [];

        const usedIds =
            new Set();


        Object.entries(
            distribution
        ).forEach(
            ([type, amount]) => {

                amount =
                    Number(amount);


                if (
                    !Number.isFinite(amount) ||
                    amount <= 0
                ) {

                    return;

                }


                let pool =
                    this.filter({

                        domain:
                            options.domain,

                        type:
                            type,

                        difficulty:
                            options.difficulty

                    });


                pool =
                    pool.filter(
                        question =>
                            !usedIds.has(
                                String(
                                    question.getId()
                                )
                            )
                    );


                pool =
                    this.shuffle(pool);


                pool
                    .slice(
                        0,
                        Math.floor(amount)
                    )
                    .forEach(
                        question => {

                            const id =
                                String(
                                    question.getId()
                                );


                            usedIds.add(id);

                            selected.push(
                                question.clone()
                            );

                        }
                    );

            }
        );


        /*
        Embaralha posição final das
        questões.
        */

        if (
            options.shuffle !== false
        ) {

            return this.shuffle(
                selected
            );

        }


        return selected;

    }


    /*
    ======================================================
    PREENCHER EXAME

    Caso uma distribuição balanceada não consiga
    atingir o total solicitado, completa usando
    questões ainda não utilizadas.
    ======================================================
    */

    fillSelection(
        selected = [],
        total,
        options = {}
    ) {

        if (!Array.isArray(selected)) {

            selected = [];

        }


        total =
            Math.max(
                0,
                Number(total) || 0
            );


        if (
            selected.length >= total
        ) {

            return selected.slice(
                0,
                total
            );

        }


        const usedIds =
            new Set(
                selected.map(
                    question =>
                        String(
                            question.getId()
                        )
                )
            );


        let pool =
            this.filter(options);


        pool =
            pool.filter(
                question =>
                    !usedIds.has(
                        String(
                            question.getId()
                        )
                    )
            );


        pool =
            this.shuffle(pool);


        const missing =
            total -
            selected.length;


        pool
            .slice(
                0,
                missing
            )
            .forEach(
                question => {

                    selected.push(
                        question.clone()
                    );

                }
            );


        if (
            options.shuffle !== false
        ) {

            selected =
                this.shuffle(selected);

        }


        return selected;

    }


    /*
    ======================================================
    CONTAGEM POR DOMÍNIO
    ======================================================
    */

    getDomainCounts() {

        const result = {};


        this.questions.forEach(
            question => {

                const domain =
                    question.getDomain();


                if (!result[domain]) {

                    result[domain] = 0;

                }


                result[domain]++;

            }
        );


        return result;

    }


    /*
    ======================================================
    CONTAGEM POR TIPO
    ======================================================
    */

    getTypeCounts(
        domain = null
    ) {

        const result = {};


        const pool =
            domain
                ? this.filterByDomain(
                    domain
                )
                : this.questions;


        pool.forEach(
            question => {

                const type =
                    question.getType();


                if (!result[type]) {

                    result[type] = 0;

                }


                result[type]++;

            }
        );


        return result;

    }


    /*
    ======================================================
    CONTAGEM POR DIFICULDADE
    ======================================================
    */

    getDifficultyCounts(
        domain = null
    ) {

        const result = {};


        const pool =
            domain
                ? this.filterByDomain(
                    domain
                )
                : this.questions;


        pool.forEach(
            question => {

                const difficulty =
                    question.getDifficulty();


                if (
                    !result[
                        difficulty
                    ]
                ) {

                    result[
                        difficulty
                    ] = 0;

                }


                result[
                    difficulty
                ]++;

            }
        );


        return result;

    }


    /*
    ======================================================
    ESTATÍSTICAS DO BANCO
    ======================================================
    */

    getStatistics() {

        return {

            total:
                this.getCount(),

            domains:
                this.getDomainCounts(),

            types:
                this.getTypeCounts(),

            difficulties:
                this.getDifficultyCounts(),

            source:
                this.source,

            loaded:
                this.loaded

        };

    }


    /*
    ======================================================
    EMBARALHAMENTO

    Fisher-Yates
    ======================================================
    */

    shuffle(array = []) {

        const result =
            [...array];


        for (
            let i =
                result.length - 1;

            i > 0;

            i--
        ) {

            const j =
                Math.floor(
                    Math.random() *
                    (i + 1)
                );


            [
                result[i],
                result[j]
            ] = [
                result[j],
                result[i]
            ];

        }


        return result;

    }


    /*
    ======================================================
    LIMPAR BANCO
    ======================================================
    */

    clear() {

        this.questions = [];

        this.loaded = false;

        this.source = null;

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.QuestionManager =
    QuestionManager;
