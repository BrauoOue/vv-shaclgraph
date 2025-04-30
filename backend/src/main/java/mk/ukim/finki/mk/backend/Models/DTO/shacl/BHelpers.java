package mk.ukim.finki.mk.backend.Models.DTO.shacl;

import java.util.HashMap;
import java.util.Map;

public class BHelpers
{
    public static boolean isNullOrEmpty(String target)
    {
        if (target == null) return true;
        return target.isEmpty();
    }

    public static Map<String, String> invertMap(Map<String, String> map)
    {
        HashMap<String, String> invertedMap = new HashMap<>();
        map.forEach((key, value) -> invertedMap.put(value, key));
        return invertedMap;
    }

}
