import { LogOut, Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router";

import { toast } from "../../lib/toast";
import { selectUser, signedOut } from "../../store/auth";
import { openComposer } from "../../store/composer";
import Avatar from "../ui/Avatar";
import Button, { ButtonLink, IconButton } from "../ui/Button";
import Logo from "../ui/Logo";
import ThemeToggle from "../ui/ThemeToggle";

const Navbar = () => {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const signOut = () => {
    dispatch(signedOut());
    toast("Signed out");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-stone-50/80 backdrop-blur-lg dark:border-stone-800/80 dark:bg-stone-950/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link
          to="/"
          className="mr-auto flex items-center gap-2.5 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-sepia-500"
        >
          <Logo className="size-8" />
          <span className="font-serif text-xl font-semibold tracking-tight">
            Sepia
          </span>
        </Link>

        {user && (
          <Button
            onClick={() => dispatch(openComposer())}
            className="max-sm:w-10 max-sm:px-0"
          >
            <Plus size={18} aria-hidden="true" />
            <span className="max-sm:sr-only">New post</span>
          </Button>
        )}
        <ThemeToggle />
        {user ? (
          <div className="flex items-center gap-2">
            <Avatar name={user.name} src={user.picture} />
            <span className="hidden max-w-40 truncate text-sm font-medium md:block">
              {user.name}
            </span>
            <IconButton label="Sign out" onClick={signOut}>
              <LogOut size={18} />
            </IconButton>
          </div>
        ) : (
          pathname !== "/auth" && <ButtonLink to="/auth">Sign in</ButtonLink>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
