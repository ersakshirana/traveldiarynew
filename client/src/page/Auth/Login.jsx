import { useState } from "react";
import PasswordFeild from "../../component/input/PasswordFeild";
import { useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/helper";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      seterror("Please enter a valid email address");
      return;
    }
    if (!password) {
      seterror("Please enter the password");
      return;
    }

    seterror("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success("Login successful!", { position: "top-right" });
        navigate("/dashboard");
      } else {
        seterror(result.error);
        toast.error(result.error, { position: "top-right" });
      }
    } catch (error) {
      const errorMsg = "An unexpected error occurred";
      seterror(errorMsg);
      toast.error(errorMsg, { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen bg-cyan-50 overflow-hidden relative">
      <ToastContainer />
      <div className="login-ui-box right-10 -top-40 hidden md:block" />
      <div className="login-ui-box bg-cyan-200 -bottom-200 -bottom-40 right-1/2 hidden md:block" />
      <div className="container h-screen flex items-center justify-center px-4 sm:px-8 md:px-20 mx-auto">
        <div className="hidden md:flex w-2/4 h-[90vh] items-end bg-login-bg-img bg-cover bg-center rounded-lg p-10 z-50">
          <div>
            <h4 className="text-5xl text-white font-semibold leading-[58px]">
              Capture Your <br /> Journeys
            </h4>
            <p className="text-[15px] text-white leading-6 pr-7 mt-4 ">
              Recored Your travel experience and memories
            </p>
          </div>
        </div>

        <div className="w-full md:w-2/4 h-auto md:h-[75vh] bg-white rounded-lg md:rounded-r-lg md:rounded-l-none relative p-8 sm:p-12 md:p-16 shadow-lg shadow-cyan-200">
          <form onSubmit={handleLogin}>
            <h4 className="text-2xl font-semibold nb-7">Login</h4>
            <input
              type="email"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={({ target }) => {
                setEmail(target.value);
              }}
              disabled={isSubmitting}
              required
            />
            <PasswordFeild
              value={password}
              onChange={({ target }) => {
                setpassword(target.value);
              }}
              disabled={isSubmitting}
              required
            />
            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button 
              type="submit" 
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "LOGGING IN..." : "LOGIN"}
            </button>
            <p className="text-x5 text-state-500 text-center my-4">OR</p>

            <button
              type="button"
              className="btn-primary btn-light"
              onClick={() => navigate("/signup")}
              disabled={isSubmitting}
            >
              CREATE ACCOUNT
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
