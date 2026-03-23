import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/logo.png";
import ProfileInfo from "./cards/ProfileInfo";
import SearchBar from "./SearchBar";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import { MdMenu, MdClose } from "react-icons/md";

const Navbar = ({
  userInfo,
  searchQuery,
  setSearchQuery,
  onSearchNote,
  handleClearSearch,
}) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const onLogOut = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    handleClearSearch();
    setSearchQuery("");
  };

  return (
    <div className="bg-white drop-shadow sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 md:px-6 py-2">
        <img src={LOGO} alt="travel-story" className="h-9 w-14 md:h-10 md:w-16" />

        {isAuthenticated && (
          <>
            {/* Desktop: inline search + profile */}
            <div className="hidden md:flex items-center gap-4">
              <SearchBar
                value={searchQuery}
                onChange={({ target }) => {
                  setSearchQuery(target.value);
                }}
                handleSearch={handleSearch}
                onClearSearch={onClearSearch}
              />
              <ProfileInfo userInfo={userInfo} onLogOut={onLogOut} />
            </div>

            {/* Mobile: hamburger toggle */}
            <button
              className="md:hidden p-2 text-slate-600 hover:text-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <MdClose className="text-2xl" />
              ) : (
                <MdMenu className="text-2xl" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden px-4 pb-3 flex flex-col gap-3 border-t border-slate-100 animate-fadeIn">
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => {
              setSearchQuery(target.value);
            }}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
          <ProfileInfo userInfo={userInfo} onLogOut={onLogOut} />
        </div>
      )}
    </div>
  );
};

export default Navbar;
