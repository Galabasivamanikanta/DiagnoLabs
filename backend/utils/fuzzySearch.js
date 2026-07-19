/**
 * Calculates the Levenshtein distance between two strings.
 * @param {string} a 
 * @param {string} b 
 * @returns {number} The distance (number of edits)
 */
const levenshteinDistance = (a, b) => {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Finds the closest match for a query string from an array of target strings.
 * @param {string} query 
 * @param {string[]} targets 
 * @param {number} maxDistance Maximum allowed typo distance (usually 2 or 3)
 * @returns {string|null} The closest matching string, or null if no good match is found
 */
const findClosestMatch = (query, targets, maxDistance = 2) => {
    if (!query || !targets || targets.length === 0) return null;
    
    query = query.toLowerCase().trim();
    let closestMatch = null;
    let minDistance = Infinity;

    for (const target of targets) {
        if (!target) continue;
        const lowerTarget = target.toLowerCase();
        
        // Direct match or substring match is always preferred
        if (lowerTarget.includes(query) || query.includes(lowerTarget)) {
            return target;
        }

        const distance = levenshteinDistance(query, lowerTarget);
        if (distance < minDistance && distance <= maxDistance) {
            minDistance = distance;
            closestMatch = target;
        }
    }

    return closestMatch;
};

module.exports = {
    levenshteinDistance,
    findClosestMatch
};
