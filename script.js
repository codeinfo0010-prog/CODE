// Estado global
let currentMode = "encrypt";
let cipherList = [];

// Inicializacao
document.addEventListener("DOMContentLoaded", function() {
    addCipherByType("cesar");
    addCipherByType("atbash");
    addCipherByType("binary");
    addCipherByType("symbols");
});

// Configurar modo
function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll(".mode-btn").forEach(function(btn) {
        btn.classList.remove("active");
    });
    event.target.classList.add("active");
    
    const slider = document.getElementById("modeSlider");
    const label = document.getElementById("inputLabel");
    
    if (mode === "encrypt") {
        slider.classList.remove("right");
        label.textContent = "Texto para criptografar";
    } else {
        slider.classList.add("right");
        label.textContent = "Texto criptografado";
    }
    
    document.getElementById("resultCard").style.display = "none";
}

// Adicionar cifra
function addCipher() {
    const select = document.getElementById("cipherSelect");
    const type = select.value;
    if (!type) return;
    addCipherByType(type);
    select.value = "";
}

function addCipherByType(type) {
    const cifra = CIFRAS[type];
    if (!cifra) return;
    
    const id = Date.now() + Math.random();
    const cipherItem = {
        id: id,
        type: type,
        params: {}
    };
    
    cifra.params.forEach(function(p) {
        cipherItem.params[p.name] = p.value;
    });
    
    cipherList.push(cipherItem);
    renderCipherList();
}

// Renderizar lista
function renderCipherList() {
    const container = document.getElementById("cipherList");
    container.innerHTML = "";
    
    cipherList.forEach(function(item, index) {
        const cifra = CIFRAS[item.type];
        const div = document.createElement("div");
        div.className = "cipher-item";
        
        let inputsHtml = cifra.params.map(function(p) {
            return '<input type="' + p.type + '" placeholder="' + p.label + '" value="' + (item.params[p.name] || p.value) + '" onchange="updateParam(' + item.id + ', \'' + p.name + '\', this.value)">';
        }).join("");
        
        div.innerHTML = 
            '<div class="cipher-number">' + (index + 1) + '</div>' +
            '<div class="cipher-content">' +
                '<div class="cipher-name">' + cifra.nome + '</div>' +
                '<div class="cipher-config">' + inputsHtml + '</div>' +
            '</div>' +
            '<div class="cipher-actions">' +
                '<button class="btn-move" onclick="moveCipher(' + item.id + ', -1)" ' + (index === 0 ? 'disabled' : '') + '>↑</button>' +
                '<button class="btn-move" onclick="moveCipher(' + item.id + ', 1)" ' + (index === cipherList.length - 1 ? 'disabled' : '') + '>↓</button>' +
                '<button class="btn-remove" onclick="removeCipher(' + item.id + ')">×</button>' +
            '</div>';
        container.appendChild(div);
    });
}

// Atualizar parametro
function updateParam(id, paramName, value) {
    const item = cipherList.find(function(c) { return c.id === id; });
    if (item) item.params[paramName] = value;
}

// Mover cifra
function moveCipher(id, direction) {
    const index = cipherList.findIndex(function(c) { return c.id === id; });
    if (index < 0) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= cipherList.length) return;
    
    const temp = cipherList[index];
    cipherList[index] = cipherList[newIndex];
    cipherList[newIndex] = temp;
    renderCipherList();
}

// Remover cifra
function removeCipher(id) {
    cipherList = cipherList.filter(function(c) { return c.id !== id; });
    renderCipherList();
}

// Limpar todas
function clearCiphers() {
    cipherList = [];
    renderCipherList();
}

// Processar
function process() {
    const input = document.getElementById("inputText").value;
    if (!input.trim()) {
        alert("Digite algum texto!");
        return;
    }
    if (cipherList.length === 0) {
        alert("Adicione pelo menos uma cifra!");
        return;
    }
    
    let result = input;
    const steps = [];
    
    try {
        if (currentMode === "encrypt") {
            for (let i = 0; i < cipherList.length; i++) {
                const item = cipherList[i];
                const cifra = CIFRAS[item.type];
                const prevResult = result;
                result = cifra.encrypt(result, item.params);
                steps.push({
                    number: i + 1,
                    name: cifra.nome,
                    input: prevResult.length > 50 ? prevResult.substring(0, 50) + "..." : prevResult,
                    output: result.length > 100 ? result.substring(0, 100) + "..." : result
                });
            }
        } else {
            for (let i = cipherList.length - 1; i >= 0; i--) {
                const item = cipherList[i];
                const cifra = CIFRAS[item.type];
                const prevResult = result;
                result = cifra.decrypt(result, item.params);
                steps.push({
                    number: cipherList.length - i,
                    name: cifra.nome,
                    input: prevResult.length > 50 ? prevResult.substring(0, 50) + "..." : prevResult,
                    output: result.length > 100 ? result.substring(0, 100) + "..." : result
                });
            }
        }
        
        document.getElementById("resultText").textContent = result;
        document.getElementById("resultCard").style.display = "block";
        
        const stepsList = document.getElementById("stepsList");
        stepsList.innerHTML = steps.map(function(step) {
            return '<div class="step-item">' +
                '<div class="step-icon">' + step.number + '</div>' +
                '<div class="step-info">' +
                    '<div class="step-name">' + step.name + '</div>' +
                    '<div class="step-result">Entrada: ' + step.input + '<br>Saida: ' + step.output + '</div>' +
                '</div>' +
            '</div>';
        }).join("");
        
        document.getElementById("stepsSection").style.display = "block";
    } catch (error) {
        alert("Erro ao processar: " + error.message);
        console.error(error);
    }
}

// Copiar resultado
function copyResult() {
    const text = document.getElementById("resultText").textContent;
    navigator.clipboard.writeText(text).then(function() {
        const btn = document.querySelector(".copy-btn");
        btn.textContent = "Copiado!";
        setTimeout(function() { btn.textContent = "Copiar"; }, 2000);
    });
}

// Atalho Ctrl+Enter
document.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.key === "Enter") process();
});