import { Moon, Sun } from "lucide-react";

import { toggleTheme, useDarkTheme } from "../../lib/theme";
import { IconButton } from "./Button";

const ThemeToggle = () => {
  const dark = useDarkTheme();

  return (
    <IconButton
      label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={toggleTheme}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </IconButton>
  );
};

export default ThemeToggle;
