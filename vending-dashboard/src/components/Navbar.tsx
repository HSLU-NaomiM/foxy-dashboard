// components/NavBar.tsx
import { NavLink } from "react-router-dom";

const NavBar = () => {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-md text-sm font-medium ${
      isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <nav className="w-full border-b border-gray-200 bg-white px-6 py-3 shadow-sm">
      <ul className="flex space-x-4">
        <li>
          <NavLink to="/dashboard" className={linkClasses}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/monitoring" className={linkClasses}>
            Monitoring
          </NavLink>
        </li>
        <li>
          <NavLink to="/revenue" className={linkClasses}>
            Revenue
          </NavLink>
        </li>
        <li>
          <NavLink to="/upload" className={linkClasses}>
            Upload
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;
