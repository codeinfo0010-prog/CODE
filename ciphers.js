// Alfabeto padrao
const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Cesar - Deslocamento configuravel
function cifraCesar(texto, deslocamento) {
    const n = parseInt(deslocamento) || 0;
    return texto.toUpperCase().split("").map(function(c) {
        const idx = ALFABETO.indexOf(c);
        return idx >= 0 ? ALFABETO[(idx + n + 26) % 26] : c;
    }).join("");
}

// Atbash - Inversao do alfabeto
function cifraAtbash(texto) {
    const invertido = ALFABETO.split("").reverse().join("");
    return texto.toUpperCase().split("").map(function(c) {
        const idx = ALFABETO.indexOf(c);
        return idx >= 0 ? invertido[idx] : c;
    }).join("");
}

// ROT13
function cifraROT13(texto) {
    return cifraCesar(texto, 13);
}

// Affine - ax + b
function cifraAffine(texto, a, b) {
    a = parseInt(a) || 1;
    b = parseInt(b) || 0;
    return texto.toUpperCase().split("").map(function(c) {
        const idx = ALFABETO.indexOf(c);
        if (idx < 0) return c;
        return ALFABETO[(a * idx + b) % 26];
    }).join("");
}

function decifraAffine(texto, a, b) {
    a = parseInt(a) || 1;
    b = parseInt(b) || 0;
    let aInv = 1;
    for (let i = 1; i < 26; i++) {
        if ((a * i) % 26 === 1) {
            aInv = i;
            break;
        }
    }
    return texto.toUpperCase().split("").map(function(c) {
        const idx = ALFABETO.indexOf(c);
        if (idx < 0) return c;
        let novoIdx = (aInv * (idx - b)) % 26;
        if (novoIdx < 0) novoIdx += 26;
        return ALFABETO[novoIdx];
    }).join("");
}

// Vigenere - Senha
function cifraVigenere(texto, senha) {
    if (!senha) return texto;
    senha = senha.toUpperCase().replace(/[^A-Z]/g, "");
    if (!senha) return texto;
    let senhaIdx = 0;
    return texto.toUpperCase().split("").map(function(c) {
        const idx = ALFABETO.indexOf(c);
        if (idx < 0) return c;
        const desloc = ALFABETO.indexOf(senha[senhaIdx % senha.length]);
        senhaIdx++;
        return ALFABETO[(idx + desloc) % 26];
    }).join("");
}

function decifraVigenere(texto, senha) {
    if (!senha) return texto;
    senha = senha.toUpperCase().replace(/[^A-Z]/g, "");
    if (!senha) return texto;
    let senhaIdx = 0;
    return texto.toUpperCase().split("").map(function(c) {
        const idx = ALFABETO.indexOf(c);
        if (idx < 0) return c;
        const desloc = ALFABETO.indexOf(senha[senhaIdx % senha.length]);
        senhaIdx++;
        let novoIdx = (idx - desloc) % 26;
        if (novoIdx < 0) novoIdx += 26;
        return ALFABETO[novoIdx];
    }).join("");
}

// Playfair - Matriz 5x5
function criarMatrizPlayfair(chave) {
    chave = (chave || "PLAYFAIR").toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
    const usados = new Set();
    const matriz = [];
    for (let c of chave + ALFABETO) {
        if (c === "J") c = "I";
        if (!usados.has(c)) {
            usados.add(c);
            matriz.push(c);
        }
    }
    return matriz;
}

function cifraPlayfair(texto, chave) {
    const matriz = criarMatrizPlayfair(chave);
    const pos = {};
    matriz.forEach(function(c, i) {
        pos[c] = { row: Math.floor(i / 5), col: i % 5 };
    });
    let prep = texto.toUpperCase().replace(/[^A-Z]/g, "").replace(/J/g, "I");
    let pares = [];
    for (let i = 0; i < prep.length; i += 2) {
        let a = prep[i];
        let b = prep[i + 1] || "X";
        if (a === b) {
            pares.push(a + "X");
            i--;
        } else {
            pares.push(a + b);
        }
    }
    return pares.map(function(par) {
        const p1 = pos[par[0]], p2 = pos[par[1]];
        if (p1.row === p2.row) {
            return matriz[p1.row * 5 + (p1.col + 1) % 5] + matriz[p2.row * 5 + (p2.col + 1) % 5];
        } else if (p1.col === p2.col) {
            return matriz[((p1.row + 1) % 5) * 5 + p1.col] + matriz[((p2.row + 1) % 5) * 5 + p2.col];
        } else {
            return matriz[p1.row * 5 + p2.col] + matriz[p2.row * 5 + p1.col];
        }
    }).join("");
}

function decifraPlayfair(texto, chave) {
    const matriz = criarMatrizPlayfair(chave);
    const pos = {};
    matriz.forEach(function(c, i) {
        pos[c] = { row: Math.floor(i / 5), col: i % 5 };
    });
    let pares = [];
    for (let i = 0; i < texto.length; i += 2) {
        pares.push(texto.substring(i, i + 2));
    }
    return pares.map(function(par) {
        const p1 = pos[par[0]], p2 = pos[par[1]];
        if (p1.row === p2.row) {
            return matriz[p1.row * 5 + (p1.col + 4) % 5] + matriz[p2.row * 5 + (p2.col + 4) % 5];
        } else if (p1.col === p2.col) {
            return matriz[((p1.row + 4) % 5) * 5 + p1.col] + matriz[((p2.row + 4) % 5) * 5 + p2.col];
        } else {
            return matriz[p1.row * 5 + p2.col] + matriz[p2.row * 5 + p1.col];
        }
    }).join("");
}

// Rail Fence - Trilhos
function cifraRailFence(texto, trilhos) {
    const n = parseInt(trilhos) || 3;
    if (n < 2) return texto;
    const rails = Array(n).fill("").map(function() { return []; });
    let rail = 0;
    let direcao = 1;
    for (let c of texto) {
        rails[rail].push(c);
        rail += direcao;
        if (rail === 0 || rail === n - 1) direcao *= -1;
    }
    return rails.map(function(r) { return r.join(""); }).join("");
}

function decifraRailFence(texto, trilhos) {
    const n = parseInt(trilhos) || 3;
    if (n < 2) return texto;
    const len = texto.length;
    const padrao = [];
    let rail = 0, direcao = 1;
    for (let i = 0; i < len; i++) {
        padrao.push(rail);
        rail += direcao;
        if (rail === 0 || rail === n - 1) direcao *= -1;
    }
    const contagem = Array(n).fill(0);
    padrao.forEach(function(r) { contagem[r]++; });
    const rails = [];
    let idx = 0;
    for (let c of contagem) {
        rails.push(texto.substring(idx, idx + c).split(""));
        idx += c;
    }
    let resultado = "";
    const indices = Array(n).fill(0);
    for (let r of padrao) {
        resultado += rails[r][indices[r]++];
    }
    return resultado;
}

// Binario
function paraBinario(texto) {
    return texto.split("").map(function(c) {
        return c.charCodeAt(0).toString(2).padStart(8, "0");
    }).join("");
}

function deBinario(binario) {
    let resultado = "";
    for (let i = 0; i < binario.length; i += 8) {
        const byte = binario.substring(i, i + 8);
        if (byte.length === 8) {
            resultado += String.fromCharCode(parseInt(byte, 2));
        }
    }
    return resultado;
}

// Simbolos
function paraSimbolos(binario, um, zero) {
    return binario.replace(/1/g, um || "1").replace(/0/g, zero || "0");
}

function deSimbolos(simbolos, um, zero) {
    let resultado = simbolos.split(zero || "0").join("0").split(um || "1").join("1");
    return resultado;
}

// Objeto com todas as cifras
const CIFRAS = {
    cesar: {
        nome: "Cesar",
        params: [{ name: "deslocamento", label: "Casas", type: "number", value: 5 }],
        encrypt: function(t, p) { return cifraCesar(t, p.deslocamento); },
        decrypt: function(t, p) { return cifraCesar(t, -(parseInt(p.deslocamento) || 0)); }
    },
    atbash: {
        nome: "Atbash",
        params: [],
        encrypt: cifraAtbash,
        decrypt: cifraAtbash
    },
    rot13: {
        nome: "ROT13",
        params: [],
        encrypt: cifraROT13,
        decrypt: cifraROT13
    },
    affine: {
        nome: "Affine",
        params: [
            { name: "a", label: "Multiplicador", type: "number", value: 5 },
            { name: "b", label: "Deslocamento", type: "number", value: 8 }
        ],
        encrypt: function(t, p) { return cifraAffine(t, p.a, p.b); },
        decrypt: function(t, p) { return decifraAffine(t, p.a, p.b); }
    },
    vigenere: {
        nome: "Vigenere",
        params: [{ name: "senha", label: "Senha", type: "text", value: "CHAVE" }],
        encrypt: function(t, p) { return cifraVigenere(t, p.senha); },
        decrypt: function(t, p) { return decifraVigenere(t, p.senha); }
    },
    playfair: {
        nome: "Playfair",
        params: [{ name: "chave", label: "Palavra-chave", type: "text", value: "PLAYFAIR" }],
        encrypt: function(t, p) { return cifraPlayfair(t, p.chave); },
        decrypt: function(t, p) { return decifraPlayfair(t, p.chave); }
    },
    railfence: {
        nome: "Rail Fence",
        params: [{ name: "trilhos", label: "Trilhos", type: "number", value: 3 }],
        encrypt: function(t, p) { return cifraRailFence(t, p.trilhos); },
        decrypt: function(t, p) { return decifraRailFence(t, p.trilhos); }
    },
    binary: {
        nome: "Binario",
        params: [],
        encrypt: paraBinario,
        decrypt: deBinario
    },
    symbols: {
        nome: "Simbolos",
        params: [
            { name: "um", label: "Simbolo 1", type: "text", value: "1" },
            { name: "zero", label: "Simbolo 0", type: "text", value: "0" }
        ],
        encrypt: function(t, p) { return paraSimbolos(t, p.um, p.zero); },
        decrypt: function(t, p) { return deSimbolos(t, p.um, p.zero); }
    }
};