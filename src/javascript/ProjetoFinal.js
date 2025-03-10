document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname.includes("lixeira.html")) {
        gerarCardsLixeira();
    } else {
        gerarCards();
    }
});


const $modal = document.getElementById('modal');
const $nomeInput = document.getElementById('nome');
const $descricaoInput = document.getElementById('descricao');
const $responsaveisInput = document.getElementById('responsaveis');
const $prioridadeInput = document.getElementById('prioridade');
const $dataInput = document.getElementById('data');
const $columnInput = document.getElementById('column');
const $idInput = document.getElementById('idInput');

const $tituloAdicionar = document.getElementById('tituloAdicionar');
const $tituloEditar = document.getElementById('tituloEditar');
const $botaoAdicionar = document.getElementById('botaoAdicionar');
const $botaoSalvar = document.getElementById('botaoSalvar');

var tarefa = localStorage.getItem("tarefa");
var listaTarefas = localStorage.getItem("tarefa") ? JSON.parse(localStorage.getItem("tarefa")) : [];
var listaTarefasExcluidas = localStorage.getItem("tarefa_excluida") ? JSON.parse(localStorage.getItem("tarefa_excluida")) : [];

gerarCards();

function openModal(column) {
    $modal.style.display = "flex";

    $columnInput.value = column;

    $tituloAdicionar.style.display = "block";
    $tituloEditar.style.display = "none";
    $botaoAdicionar.style.display = "block";
    $botaoSalvar.style.display = "none";
}

function openModalToEdit(id) {
    $modal.style.display = "flex";
    $tituloAdicionar.style.display = "none";
    $tituloEditar.style.display = "block";
    $botaoAdicionar.style.display = "none";
    $botaoSalvar.style.display = "block";

    const index = listaTarefas.findIndex(function (tarefa) {
        return tarefa.id == id;
    });

    if (index !== -1) {
        const tarefa = listaTarefas[index];

        $idInput.value = tarefa.id;
        $nomeInput.value = tarefa.nome;
        $descricaoInput.value = tarefa.descricao;
        $responsaveisInput.value = tarefa.responsaveis;
        $prioridadeInput.value = tarefa.prioridade;
        $dataInput.value = tarefa.data;
        $columnInput.value = tarefa.column;
    } else {
        console.error("Tarefa não encontrada");
    }
}

function closeModal() {
    $modal.style.display = "none";
    $idInput.value = "";
    $nomeInput.value = "";
    $descricaoInput.value = "";
    $responsaveisInput.value = "";
    $prioridadeInput.value = "";
    $dataInput.value = "";
    $columnInput.value = "";
}

function resetarColunas() {
    document.querySelector('[data-column="1"] .body .card_list').innerHTML = '';
    document.querySelector('[data-column="2"] .body .card_list').innerHTML = '';
    document.querySelector('[data-column="3"] .body .card_list').innerHTML = '';
}

function gerarCards() {
    resetarColunas();

    const agora = moment();
    const horas48 = moment().add(48, 'hours');

    listaTarefas.forEach(function (tarefa) {
        const dataVencimento = moment(tarefa.data);
        const dataFormatada = dataVencimento.format('DD/MM/YYYY');
        const $card = document.createElement('div');
        $card.classList.add('card');
        $card.setAttribute('draggable', 'true');
        $card.setAttribute('data-id', tarefa.id);
        $card.setAttribute('ondragstart', 'dragstart_handler(event)');

        if (dataVencimento.isBetween(agora, horas48)) {
            $card.classList.add('highlight');
        }

        $card.innerHTML = `
            <div>
                <p><strong>Nome:</strong> ${tarefa.nome}</p>
                <p><strong>Descrição:</strong> ${tarefa.descricao}</p>
                <p><strong>Responsáveis:</strong> ${tarefa.responsaveis}</p>
                <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>
                <p><strong>Data de vencimento:</strong> ${dataFormatada}</p>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 4px;">
                <button class="botao-card" onclick="excluirTarefa(${tarefa.id})">
                    Excluir
                </button>
                <button class="botao-card" onclick="openModalToEdit(${tarefa.id})">
                    Editar
                </button>
            </div>
        `;

        document.querySelector('[data-column="' + tarefa.column + '"] .body .card_list').appendChild($card);
    });

    localStorage.setItem("tarefa", JSON.stringify(listaTarefas));
}


function adicionarTarefa() {
    if ($nomeInput.value == '') return alert("Insira um nome!");

    const tarefa = {
        id: Date.now(),
        nome: $nomeInput.value,
        descricao: $descricaoInput.value,
        responsaveis: $responsaveisInput.value,
        prioridade: $prioridadeInput.value,
        data: $dataInput.value,
        column: $columnInput.value
    };

    listaTarefas.push(tarefa);
    gerarCards();
    closeModal();
}

function salvarAlteracoes() {
    const id = $idInput.value;
    const nome = $nomeInput.value;
    const descricao = $descricaoInput.value;
    const responsaveis = $responsaveisInput.value;
    const prioridade = $prioridadeInput.value;
    const data = $dataInput.value;
    const column = $columnInput.value;

    const index = listaTarefas.findIndex(tarefa => tarefa.id == id);

    if (index !== -1) {
        listaTarefas[index] = {
            id: id,
            nome: nome,
            descricao: descricao,
            responsaveis: responsaveis,
            prioridade: prioridade,
            data: data,
            column: column
        };

        gerarCards();
        closeModal();
    } else {
        console.error("Tarefa não encontrada para salvar alterações");
    }
}

function excluirTarefa(id) {
    const index = listaTarefas.findIndex(tarefa => tarefa.id == id);

    if (index !== -1) {
        const tarefaExcluida = listaTarefas.splice(index, 1)[0];
        tarefaExcluida.column = 4;
        listaTarefasExcluidas.push(tarefaExcluida);
        gerarCards();
        localStorage.setItem("tarefa", JSON.stringify(listaTarefas));
        localStorage.setItem("tarefa_excluida", JSON.stringify(listaTarefasExcluidas));
    } else {
        console.error("Tarefa não encontrada para exclusão");
    }
}
function gerarCardsLixeira() {
    document.querySelector('[data-column="4"] .body .card_list').innerHTML = '';

    listaTarefasExcluidas.forEach(function (tarefa) {
        const dataFormatada = moment(tarefa.data).format('DD/MM/YYYY');
        const $card = document.createElement('div');
        $card.classList.add('card');
        $card.setAttribute('draggable', 'true');
        $card.setAttribute('data-id', tarefa.id);
        $card.setAttribute('ondragstart', 'dragstart_handler(event)');

        $card.innerHTML = `
            <div>
                <p><strong>Nome:</strong> ${tarefa.nome}</p>
                <p><strong>Descrição:</strong> ${tarefa.descricao}</p>
                <p><strong>Responsáveis:</strong> ${tarefa.responsaveis}</p>
                <p><strong>Prioridade:</strong> ${tarefa.prioridade}</p>
                <p><strong>Data de vencimento:</strong> ${dataFormatada}</p>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 4px;">
                <button class="botao-card" onclick="excluirTarefaDefinitivamente(${tarefa.id})">
                    Excluir definitivamente
                </button>
            </div>
        `;

        document.querySelector('[data-column="4"] .body .card_list').appendChild($card);
    });
}

function excluirTarefaDefinitivamente(id) {
    const index = listaTarefasExcluidas.findIndex(tarefa => tarefa.id == id);

    if (index !== -1) {
        listaTarefasExcluidas.splice(index, 1);
        gerarCardsLixeira();
        localStorage.setItem("tarefa_excluida", JSON.stringify(listaTarefasExcluidas));
    } else {
        console.error("Tarefa não encontrada para exclusão definitiva");
    }
}

function dragstart_handler(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.getAttribute('data-id'));
}

function dragover_handler(ev) {
    ev.preventDefault();
}

function drop_handler(ev) {
    ev.preventDefault();

    const id = ev.dataTransfer.getData("text/plain");
    const column = ev.target.closest('.column').getAttribute('data-column');

    const index = listaTarefas.findIndex(tarefa => tarefa.id == id);

    if (index !== -1) {
        listaTarefas[index].column = column;
        gerarCards();
    } else {
        console.error("Tarefa não encontrada para alteração de coluna");
    }
}

function esvaziarLixeira() {
    listaTarefasExcluidas = [];
    localStorage.setItem("tarefa_excluida", JSON.stringify(listaTarefasExcluidas));
    gerarCardsLixeira();
}

