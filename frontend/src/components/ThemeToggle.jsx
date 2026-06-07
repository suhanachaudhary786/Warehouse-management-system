
import { FaMoon, FaSun } from "react-icons/fa";

import { useTheme } from "../context/ThemeContext";

function ThemeToggle() {
    const {
        darkMode,
        setDarkMode,
    } = useTheme();

    return (
        <button
            onClick={() =>
                setDarkMode(!darkMode)
            }
            className="
      p-2
      rounded-lg
      border
      hover:shadow
      "
        >
            {darkMode ? (
                <FaSun />
            ) : (
                <FaMoon />
            )}
        </button>
    );
}

export default ThemeToggle;