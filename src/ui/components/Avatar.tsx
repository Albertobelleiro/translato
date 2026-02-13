import { SignOutButton, useUser } from "@clerk/clerk-react";
import { Facehash } from "facehash";
import { useEffect, useRef, useState } from "react";

export function Avatar() {
  const { user } = useUser();
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [menuOpen]);

  return (
    <div className="avatar-wrapper" ref={containerRef}>
      <button
        className="avatar-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="User menu"
      >
        <Facehash name={user?.id ?? "anonymous"} size={28} style={{ borderRadius: "50%" }} />
      </button>
      {menuOpen && (
        <div className="avatar-menu">
          <div className="avatar-menu-info">
            <span className="avatar-menu-name">{user?.fullName ?? "User"}</span>
            <span className="avatar-menu-email">{user?.primaryEmailAddress?.emailAddress}</span>
          </div>
          <div className="avatar-menu-divider" />
          <SignOutButton>
            <button type="button" className="avatar-menu-item">Sign out</button>
          </SignOutButton>
        </div>
      )}
    </div>
  );
}
