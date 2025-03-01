// conditionalObjectMerging.js
function mergeWithCondition(objA, objB) {
    for (const key in objA) {
        const valueA = objA[key];
        const valueB = objB[key];

        if (typeof valueA === "object" && valueA !== null) {
            if (typeof valueB === "object" && valueB !== null) {
                mergeWithCondition(valueA, valueB); // Recursive merge if both are objects
            } else if (valueB === undefined) {
                objB[key] = structuredClone(valueA); // Deep copy if B[key] is undefined
            }
        } else if (valueB === undefined) {
            objB[key] = valueA; // Assign primitive values if B[key] is undefined
        }
    }
    return objB;
}
module.exports = mergeWithCondition;