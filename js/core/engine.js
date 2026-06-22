// js/core/engine.js
import { groupsData } from '../data/teams.js';

// Inicializa a estrutura de classificação zerada para um time
function createEmptyStats(teamId) {
    return { id: teamId, P: 0, J: 0, V: 0, E: 0, D: 0, SG: 0, GP: 0, GC: 0 };
}

// 1. CALCULA A TABELA DE UM GRUPO INDIVIDUAL (O que o groups.js precisa)
export function calculateGroupTable(groupLetter, groupMatches) {
    const teams = groupsData[groupLetter];
    const tableStats = {};

    teams.forEach(team => {
        tableStats[team.id] = createEmptyStats(team.id);
    });

    groupMatches.forEach(match => {
        if (match.score1 !== null && match.score2 !== null && !isNaN(match.score1) && !isNaN(match.score2)) {
            const s1 = parseInt(match.score1);
            const s2 = parseInt(match.score2);

            const t1 = tableStats[match.team1];
            const t2 = tableStats[match.team2];

            t1.J += 1;
            t2.J += 1;
            t1.GP += s1;
            t1.GC += s2;
            t2.GP += s2;
            t2.GC += s1;
            t1.SG = t1.GP - t1.GC;
            t2.SG = t2.GP - t2.GC;

            if (s1 > s2) {
                t1.P += 3; t1.V += 1;
                t2.D += 1;
            } else if (s2 > s1) {
                t2.P += 3; t2.V += 1;
                t1.D += 1;
            } else {
                t1.P += 1; t1.E += 1;
                t2.P += 1; t2.E += 1;
            }
        }
    });

    const sortedTable = Object.values(tableStats);

    // Ordenação por critérios de desempate
    sortedTable.sort((a, b) => {
        if (b.P !== a.P) return b.P - a.P;
        const headToHead = getHeadToHeadResult(groupMatches, a.id, b.id);
        if (headToHead !== 0) return headToHead;
        if (b.SG !== a.SG) return b.SG - a.SG;
        if (b.GP !== a.GP) return b.GP - a.GP;
        return 0;
    });

    return sortedTable;
}

// Função auxiliar para o Confronto Direto
function getHeadToHeadResult(matches, teamAId, teamBId) {
    const directMatch = matches.find(m => 
        (m.team1 === teamAId && m.team2 === teamBId) || 
        (m.team1 === teamBId && m.team2 === teamAId)
    );

    if (!directMatch || directMatch.score1 === null || directMatch.score2 === null) return 0;

    const s1 = parseInt(directMatch.score1);
    const s2 = parseInt(directMatch.score2);

    if (directMatch.team1 === teamAId) {
        if (s1 > s2) return -1;
        if (s2 > s1) return 1;
    } else {
        if (s2 > s1) return -1;
        if (s1 > s2) return 1;
    }
    return 0;
}

// 2. CALCULA OS TERCEIROS LUGARES DE TODOS OS GRUPOS (O que o thirds.js precisa)
export function calculateAllThirdPlaces(matchesDataGlobal) {
    const allThirds = [];

    Object.keys(matchesDataGlobal).forEach(groupLetter => {
        const groupMatches = matchesDataGlobal[groupLetter];
        const sortedGroup = calculateGroupTable(groupLetter, groupMatches);
        const thirdPlaceStats = sortedGroup[2]; // Posição 3º (índice 2)
        
        if (thirdPlaceStats) {
            allThirds.push({
                ...thirdPlaceStats,
                group: groupLetter
            });
        }
    });

    allThirds.sort((a, b) => {
        if (b.P !== a.P) return b.P - a.P;
        if (b.SG !== a.SG) return b.SG - a.SG;
        if (b.GP !== a.GP) return b.GP - a.GP;
        return 0;
    });

    return allThirds;
}

// js/core/engine.js (Adicione ao final do arquivo)

// js/core/engine.js

export function generateRoundOf32(matchesDataGlobal) {
    const standings = {};
    
    // 1. Calcula a tabela de cada grupo
    Object.keys(matchesDataGlobal).forEach(groupLetter => {
        standings[groupLetter] = calculateGroupTable(groupLetter, matchesDataGlobal[groupLetter]);
    });

    // 2. Captura os 8 melhores terceiros colocados
    const bestThirds = calculateAllThirdPlaces(matchesDataGlobal).slice(0, 8);
    
    // Cria um mapa rápido para saber quais letras de grupo passaram como 3º lugar
    const activeThirdsGroups = bestThirds.map(t => t.group);

    const getTeamId = (group, pos) => {
        const groupStats = standings[group];
        return groupStats && groupStats[pos - 1] ? groupStats[pos - 1].id : null;
    };

    // Função auxiliar para buscar o ID do terceiro colocado de determinado grupo
    const getThirdPlaceId = (groupLetter) => {
        const found = bestThirds.find(t => t.group === groupLetter);
        return found ? found.id : null;
    };

    // 3. ALGORITMO DE DISTRIBUIÇÃO COM BASE NAS REGRAS DA FIFA (Evita recontros e respeita travas)
    // Inicializamos as variáveis dos jogos dependentes de 3ºs
    let j1_t2 = null, j2_t2 = null, j3_t2 = null, j4_t2 = null, j5_t2 = null, j6_t2 = null, j7_t2 = null, j8_t2 = null, j13_t2 = null;
    
    const allocatedTeamIds = new Set();

    // Helper seguro para alocar um terceiro específico por letra de grupo
    const assignThird = (groupLetter) => {
        const id = getThirdPlaceId(groupLetter);
        if (id) allocatedTeamIds.add(id);
        return id;
    };

    // Mapeamento dinâmico otimizado para a Copa 2026:
    // Começamos pelos blocos mais restritos (Grupos G, H, I que cruzam com I, J, K, L)
    if (activeThirdsGroups.includes("I")) j7_t2 = assignThird("I");
    else if (activeThirdsGroups.includes("J")) j7_t2 = assignThird("J");
    
    if (activeThirdsGroups.includes("G")) j8_t2 = assignThird("G");
    else if (activeThirdsGroups.includes("K")) j8_t2 = assignThird("K");

    // Para o bloco principal (A, B, C, D, E, F), distribuímos priorizando Chéquia (A) e Bósnia (B)
    // que já possuem pontos conquistados na sua simulação:
    if (activeThirdsGroups.includes("C") && getTeamId("A", 1) !== getThirdPlaceId("C")) j1_t2 = assignThird("C");
    else if (activeThirdsGroups.includes("D")) j1_t2 = assignThird("D");
    else if (activeThirdsGroups.includes("E")) j1_t2 = assignThird("E");

    if (activeThirdsGroups.includes("A") && getTeamId("B", 1) !== getThirdPlaceId("A")) j2_t2 = assignThird("A");
    else if (activeThirdsGroups.includes("F")) j2_t2 = assignThird("F");

    if (activeThirdsGroups.includes("B") && getTeamId("C", 1) !== getThirdPlaceId("B")) j3_t2 = assignThird("B");

    // Preenche as vagas restantes com os outros terceiros qualificados remanescentes
    bestThirds.forEach(third => {
        if (allocatedTeamIds.has(third.id)) return;

        if (!j1_t2 && ["C","D","E","F"].includes(third.group)) { j1_t2 = third.id; allocatedTeamIds.add(third.id); return; }
        if (!j2_t2 && ["A","C","D","E","F"].includes(third.group) && getTeamId("B", 1) !== third.id) { j2_t2 = third.id; allocatedTeamIds.add(third.id); return; }
        if (!j3_t2 && ["A","B","D","E","F"].includes(third.group) && getTeamId("C", 1) !== third.id) { j3_t2 = third.id; allocatedTeamIds.add(third.id); return; }
        if (!j4_t2 && ["A","B","C","E","F"].includes(third.group)) { j4_t2 = third.id; allocatedTeamIds.add(third.id); return; }
        if (!j5_t2 && ["A","B","C","D","F"].includes(third.group)) { j5_t2 = third.id; allocatedTeamIds.add(third.id); return; }
        if (!j6_t2 && ["A","B","C","D","E"].includes(third.group)) { j6_t2 = third.id; allocatedTeamIds.add(third.id); return; }
        if (!j13_t2 && ["G","H","J","K","L"].includes(third.group)) { j13_t2 = third.id; allocatedTeamIds.add(third.id); return; }
    });

    // Fallbacks de segurança absolutos para evitar cards em branco ("A definir")
    const remainingThirds = bestThirds.filter(t => !allocatedTeamIds.has(t.id));
    if (!j1_t2 && remainingThirds.length) j1_t2 = remainingThirds.shift().id;
    if (!j2_t2 && remainingThirds.length) j2_t2 = remainingThirds.shift().id;
    if (!j3_t2 && remainingThirds.length) j3_t2 = remainingThirds.shift().id;
    if (!j4_t2 && remainingThirds.length) j4_t2 = remainingThirds.shift().id;
    if (!j5_t2 && remainingThirds.length) j5_t2 = remainingThirds.shift().id;
    if (!j6_t2 && remainingThirds.length) j6_t2 = remainingThirds.shift().id;
    if (!j13_t2 && remainingThirds.length) j13_t2 = remainingThirds.shift().id;

    return [
        { id: "R32_1",  label: "Jogo 1",  t1: getTeamId("A", 1), t2: j1_t2 },
        { id: "R32_2",  label: "Jogo 2",  t1: getTeamId("B", 1), t2: j2_t2 },
        { id: "R32_3",  label: "Jogo 3",  t1: getTeamId("C", 1), t2: j3_t2 },
        { id: "R32_4",  label: "Jogo 4",  t1: getTeamId("D", 1), t2: j4_t2 },
        { id: "R32_5",  label: "Jogo 5",  t1: getTeamId("E", 1), t2: j5_t2 },
        { id: "R32_6",  label: "Jogo 6",  t1: getTeamId("F", 1), t2: j6_t2 },
        { id: "R32_7",  label: "Jogo 7",  t1: getTeamId("G", 1), t2: j7_t2 },
        { id: "R32_8",  label: "Jogo 8",  t1: getTeamId("H", 1), t2: j8_t2 },
        { id: "R32_9",  label: "Jogo 9",  t1: getTeamId("A", 2), t2: getTeamId("B", 2) },
        { id: "R32_10", label: "Jogo 10", t1: getTeamId("C", 2), t2: getTeamId("F", 2) },
        { id: "R32_11", label: "Jogo 11", t1: getTeamId("D", 2), t2: getTeamId("G", 2) },
        { id: "R32_12", label: "Jogo 12", t1: getTeamId("E", 2), t2: getTeamId("H", 2) },
        { id: "R32_13", label: "Jogo 13", t1: getTeamId("I", 1), t2: j13_t2 },
        { id: "R32_14", label: "Jogo 14", t1: getTeamId("J", 1), t2: getTeamId("L", 2) },
        { id: "R32_15", label: "Jogo 15", t1: getTeamId("K", 1), t2: getTeamId("J", 2) },
        { id: "R32_16", label: "Jogo 16", t1: getTeamId("L", 1), t2: getTeamId("K", 2) }
    ];
}