import { useNavigate } from "react-router-dom";
import LOGO from "../../assets/logo.png";
import ProfileInfo from "./cards/ProfileInfo";
import SearchBar from "./SearchBar";
import { useAuth } from "../../context/AuthContext";

const Navbar = ({
  userInfo,
  searchQuery,
  setSearchQuery,
  onSearchNote,
  handleClearSearch,
}) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

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
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow top-0 z-10">
      <img src={LOGO} alt="travel-story" className="h-10 w-16" />

      {isAuthenticated && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={({ target }) => {
              setSearchQuery(target.value);
            }}
            handleSearch={handleSearch}
            onClearSearch={onClearSearch}
          />
          <ProfileInfo userInfo={userInfo} onLogOut={onLogOut} />
        </>
      )}
    </div>
  );
};

export default Navbar;
