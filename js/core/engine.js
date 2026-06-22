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

// js/core/engine.js

export function generateRoundOf32(matchesDataGlobal) {
    const standings = {};
    
    // 1. Calcula a classificação final de cada grupo
    Object.keys(matchesDataGlobal).forEach(groupLetter => {
        standings[groupLetter] = calculateGroupTable(groupLetter, matchesDataGlobal[groupLetter]);
    });

    // 2. Coleta os 8 melhores terceiros colocados ordenados por mérito
    const bestThirds = calculateAllThirdPlaces(matchesDataGlobal).slice(0, 8);

    const getTeamId = (group, pos) => {
        const groupStats = standings[group];
        return groupStats && groupStats[pos - 1] ? groupStats[pos - 1].id : null;
    };

    // Helper dinâmico para alocar os terceiros respeitando os grupos permitidos pela FIFA na pág 23
    const getThirdForSlot = (allowedGroups, usedTeamsSet) => {
        // Encontra o melhor terceiro qualificado que pertença aos grupos permitidos e que não tenha sido usado
        const found = bestThirds.find(t => allowedGroups.includes(t.group) && !usedTeamsSet.has(t.id));
        if (found) {
            usedTeamsSet.add(found.id);
            return found.id;
        }
        return null; // Retorna nulo se não houver terceiro qualificado para essa combinação de chaves
    };

    const usedThirds = new Set();

    // 3. RETORNA EXATAMENTE A ESTRUTURA DA PÁGINA 23 DO REGULAMENTO DA FIFA
    return [
        { id: "R32_1",  label: "M73", t1: getTeamId("A", 2), t2: getTeamId("B", 2) }, // M73: 2A vs 2B
        { id: "R32_2",  label: "M74", t1: getTeamId("E", 1), t2: getThirdForSlot(["A","B","C","D","F"], usedThirds) }, // M74: 1E vs 3ABCDF
        { id: "R32_3",  label: "M75", t1: getTeamId("F", 1), t2: getTeamId("C", 2) }, // M75: 1F vs 2C
        { id: "R32_4",  label: "M76", t1: getTeamId("C", 1), t2: getTeamId("F", 2) }, // M76: 1C vs 2F (O Brasil em 1º cai aqui!)
        { id: "R32_5",  label: "M77", t1: getTeamId("I", 1), t2: getThirdForSlot(["C","D","F","G","H"], usedThirds) }, // M77: 1I vs 3CDFGH
        { id: "R32_6",  label: "M78", t1: getTeamId("E", 2), t2: getTeamId("I", 2) }, // M78: 2E vs 2I
        { id: "R32_7",  label: "M79", t1: getTeamId("A", 1), t2: getThirdForSlot(["C","E","F","H","I"], usedThirds) }, // M79: 1A vs 3CEFHI (México cai aqui!)
        { id: "R32_8",  label: "M80", t1: getTeamId("L", 1), t2: getThirdForSlot(["E","H","I","J","K"], usedThirds) }, // M80: 1L vs 3EHIJK
        { id: "R32_9",  label: "M81", t1: getTeamId("D", 1), t2: getThirdForSlot(["B","E","F","I","J"], usedThirds) }, // M81: 1D vs 3BEFIJ
        { id: "R32_10", label: "M82", t1: getTeamId("G", 1), t2: getThirdForSlot(["A","E","H","I","J"], usedThirds) }, // M82: 1G vs 3AEHIJ
        { id: "R32_11", label: "M83", t1: getTeamId("K", 2), t2: getTeamId("L", 2) }, // M83: 2K vs 2L
        { id: "R32_12", label: "M84", t1: getTeamId("H", 1), t2: getTeamId("J", 2) }, // M84: 1H vs 2J
        { id: "R32_13", label: "M85", t1: getTeamId("B", 1), t2: getThirdForSlot(["E","F","G","I","J"], usedThirds) }, // M85: 1B vs 3EFGIJ (Canadá cai aqui!)
        { id: "R32_14", label: "M86", t1: getTeamId("J", 1), t2: getTeamId("H", 2) }, // M86: 1J vs 2H
        { id: "R32_15", label: "M87", t1: getTeamId("K", 1), t2: getThirdForSlot(["D","E","I","J","L"], usedThirds) }, // M87: 1K vs 3DEIJL
        { id: "R32_16", label: "M88", t1: getTeamId("D", 2), t2: getTeamId("G", 2) }  // M88: 2D vs 2G
    ];
}