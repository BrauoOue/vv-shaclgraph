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