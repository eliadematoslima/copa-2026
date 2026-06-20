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