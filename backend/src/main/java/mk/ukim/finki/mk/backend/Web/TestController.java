package mk.ukim.finki.mk.backend.Web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller()
@RequestMapping("/")
@CrossOrigin(origins = "http://localhost:3000")
public class TestController
{

    @GetMapping(value = "status")
    @ResponseBody
    public String tmp ()
    {
        return "Working";
    }
}
