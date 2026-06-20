// js/core/engine.js
import { groupsData } from '../data/teams.js';

// Inicializa a estrutura de classificação zerada para um time
function createEmptyStats(teamId) {
    return { id: teamId, P: 0, J: 0, V: 0, E: 0, D: 0, SG: 0, GP: 0, GC: 0 };
}

// Calcula as estatísticas de um grupo baseado nos seus jogos atuais
export function calculateGroupTable(groupLetter, groupMatches) {
    const teams = groupsData[groupLetter];
    const tableStats = {};

    // Inicializa todos os times do grupo com zero
    teams.forEach(team => {
        tableStats[team.id] = createEmptyStats(team.id);
    });

    // Processa cada partida do grupo
    groupMatches.forEach(match => {
        // Só calcula se ambos os placares forem preenchidos (números válidos)
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

    // Converte o objeto em Array para podermos ordenar
    const sortedTable = Object.values(tableStats);

    // ORDENAÇÃO USANDO OS CRITÉRIOS OFICIAIS DA FIFA 2026
    sortedTable.sort((a, b) => {
        // 1º Critério: Pontos
        if (b.P !== a.P) return b.P - a.P;

        // 2º Critério: Confronto Direto (apenas se houver empate de pontos)
        const headToHead = getHeadToHeadResult(groupMatches, a.id, b.id);
        if (headToHead !== 0) return headToHead;

        // 3º Critério: Saldo de Gols Geral
        if (b.SG !== a.SG) return b.SG - a.SG;

        // 4º Critério: Gols Pró Geral
        if (b.GP !== a.GP) return b.GP - a.GP;

        return 0; // Se persistir, mantém a ordem original (ou ranking)
    });

    return sortedTable;
}

// Função auxiliar para calcular o Confronto Direto entre dois times específicos
function getHeadToHeadResult(matches, teamAId, teamBId) {
    const directMatch = matches.find(m => 
        (m.team1 === teamAId && m.team2 === teamBId) || 
        (m.team1 === teamBId && m.team2 === teamAId)
    );

    if (!directMatch || directMatch.score1 === null || directMatch.score2 === null) return 0;

    const s1 = parseInt(directMatch.score1);
    const s2 = parseInt(directMatch.score2);

    // Se o time 1 for o Team A
    if (directMatch.team1 === teamAId) {
        if (s1 > s2) return -1; // A ganha (b vem depois)
        if (s2 > s1) return 1;  // B ganha (b vem antes)
    } else { // Se o time 2 for o Team A
        if (s2 > s1) return -1; // A ganha
        if (s1 > s2) return 1;  // B ganha
    }
    
    // Se empatou no confronto direto, decide pelo saldo de gols do confronto direto
    return 0;
}