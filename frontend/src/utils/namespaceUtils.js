import { fetchNamespaceByUrl } from '../repository/namespaceRepository.js';

/**
 * Populates namespace maps with shapes and predicates data
 * @param {Array} namespaces - Array of namespace objects
 * @param {Function} setNamespaceToShapes - Function to update namespace to shapes map
 * @param {Function} setNamespaceToPredicates - Function to update namespace to predicates map
 */
export const populateNamespaceMaps = (namespaces, setNamespaceToShapes, setNamespaceToPredicates) => {
    const shapesMap = {};
    const predicatesMap = {};

    // Initialize empty string key for namespaces with null/undefined names
    shapesMap[""] = [];
    predicatesMap[""] = [];

    namespaces.forEach(namespace => {
        if (namespace) {
            const nsPrefix = namespace.nsPrefix || "";

            // Populate shapes map
            if (namespace.shapes && Array.isArray(namespace.shapes)) {
                // Get all shape names, handling potentially undefined names
                const shapeNames = namespace.shapes
                    .map(shape => shape.name)
                    .filter(name => name !== undefined && name !== null);

                if (nsPrefix) {
                    shapesMap[nsPrefix] = shapeNames;
                } else {
                    // Add to the empty key collection
                    shapesMap[""] = [...shapesMap[""], ...shapeNames];
                }
            } else if (nsPrefix) {
                shapesMap[nsPrefix] = [];
            }

            // Populate predicates map
            if (namespace.predicates && Array.isArray(namespace.predicates)) {
                // Get all predicate names, handling potentially undefined names
                const predicateNames = namespace.predicates
                    .map(predicate => predicate.name)
                    .filter(name => name !== undefined && name !== null);

                if (nsPrefix) {
                    predicatesMap[nsPrefix] = predicateNames;
                } else {
                    // Add to the empty key collection
                    predicatesMap[""] = [...predicatesMap[""], ...predicateNames];
                }
            } else if (nsPrefix) {
                predicatesMap[nsPrefix] = [];
            }
        }
    });

    setNamespaceToShapes(shapesMap);
    setNamespaceToPredicates(predicatesMap);
    console.log(shapesMap)
    console.log(predicatesMap)
};

/**
 * Updates global namespaces by fetching details for new namespaces and combining with existing ones
 * @param {Object} responseData - Data containing namespaces to process
 * @param {Array} globalNamespaces - Existing namespaces from context
 * @param {Function} setGlobalNamespaces - Function to update global namespaces
 * @param {Function} setNamespaceToShapes - Function to update namespace to shapes map
 * @param {Function} setNamespaceToPredicates - Function to update namespace to predicates map
 * @returns {Promise<void>}
 */
export const updateGlobalNamespaces = async (responseData, globalNamespaces, setGlobalNamespaces, setNamespaceToShapes = null, setNamespaceToPredicates = null) => {
    if (!responseData || !responseData.namespaces || !Array.isArray(responseData.namespaces)) {
        console.error('No valid namespaces in response data');
        return;
    }

    try {
        // Fetch detailed namespace information for each namespace in the response
        const fetchPromises = responseData.namespaces.map(async (namespace) => {
            if (namespace && namespace.url) {
                try {
                    return await fetchNamespaceByUrl(namespace.url);
                } catch (error) {
                    console.error(`Error fetching namespace for ${namespace.url}:`, error);
                    return null;
                }
            }
            return null;
        });

        // Wait for all namespace fetches to complete
        const fetchedNamespaces = await Promise.all(fetchPromises);
        const validNamespaces = fetchedNamespaces.filter(ns => ns !== null);

        // Combine with existing namespaces (if any)
        if (globalNamespaces) {
            // Create a map of existing namespaces by URL to avoid duplicates
            const existingNamespacesMap = new Map(
                globalNamespaces.map(ns => [ns.url, ns])
            );

            // Add new namespaces that don't already exist
            validNamespaces.forEach(ns => {
                if (!existingNamespacesMap.has(ns.url)) {
                    existingNamespacesMap.set(ns.url, ns);
                }
            });

            // Convert map back to array
            const finalNamespaces = Array.from(existingNamespacesMap.values());
            setGlobalNamespaces(finalNamespaces);

            // Populate the namespace maps if the setter functions are provided
            if (setNamespaceToShapes && setNamespaceToPredicates) {
                populateNamespaceMaps(finalNamespaces, setNamespaceToShapes, setNamespaceToPredicates);
            }
        } else {
            // If no existing namespaces, just set the new ones
            setGlobalNamespaces(validNamespaces);

            // Populate the namespace maps if the setter functions are provided
            if (setNamespaceToShapes && setNamespaceToPredicates) {
                populateNamespaceMaps(validNamespaces, setNamespaceToShapes, setNamespaceToPredicates);
            }
        }
    } catch (error) {
        console.error('Error updating global namespaces:', error);
    }
};
