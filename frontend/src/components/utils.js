export function getType(thing)
{
    if (Array.isArray(thing))
    {
        return "array";
    }

    if (Object.prototype.toString.call(thing) === '[object Object]')
    {
        return "json";
    }

    return typeof thing;
}

export const getNullablePredicates = (shaclObj) =>
{
    return  Object.keys(shaclObj)
        .filter(key => shaclObj[key] === null);

}

export const getNamespaceMap = (namespacesList) =>
{
    if (!namespacesList) return {}
    const result = {}
    for (const namespaceObject of namespacesList)
    {
        result[namespaceObject.prefix] = namespaceObject.url;
    }
    return result
}

export const createEmptyRdfObj = ({namespace = "", nsPrefix = "", resource = ""}) =>
{
    return {
        namespace: namespace,
        nsPrefix: nsPrefix,
        resource: resource,
    }
}

export const createEmptyShaclShape = (shapeName ,targetClass ) => ({
    shapeName: shapeName,
    targetClass: targetClass,
    targetNode: null,
    targetSubjectsOf: null,
    targetObjectsOf: null,
    message: null,
    severity: {
        namespace: "http://www.w3.org/ns/shacl#",
        nsPrefix: "sh",
        resource: "Violation"
    },
    properties: []
});