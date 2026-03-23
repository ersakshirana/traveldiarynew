import { useState } from "react";
import PasswordFeild from "../../component/input/PasswordFeild";
import { useNavigate } from "react-router-dom";
import { validateEmail, validatePassword } from "../../utils/helper";
import { useAuth } from "../../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";

function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setpassword] = useState("");
  const [error, seterror] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      seterror("Please enter your name");
      return;
    }

    if (name.trim().length < 2) {
      seterror("Name must be at least 2 characters long");
      return;
    }

    if (!validateEmail(email)) {
      seterror("Please enter a valid email address");
      return;
    }

    if (!password) {
      seterror("Please enter the password");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      seterror(passwordValidation.message);
      return;
    }

    seterror("");
    setIsSubmitting(true);

    try {
      const result = await signup(name, email, password);
      if (result.success) {
        toast.success("Account created successfully!", {
          position: "top-right",
        });
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
      <div className="login-ui-box right-10 -top-40" />
      <div className="login-ui-box bg-cyan-200 -bottom-200 -bottom-40 right-1/2" />
      <div className="container h-screen flex items-center justify-center px-20 mx-auto">
        <div className="w-2/4 h-[90vh] flex items-end bg-signup-bg-img bg-cover bg-center rounded-lg p-10 z-50">
          <div>
            <h4 className="text-5xl text-white font-semibold leading-[58px]">
              Join the <br /> Adventure
            </h4>
            <p className="text-[15px] text-white leading-6 pr-7 mt-4 ">
              Create an account to start documenting your travel journals
            </p>
          </div>
        </div>

        <div className="w-2/4 h-[75vh] bg-white rounded-r-lg relative p-16 shadow-lg shadow-cyan-200 overflow-y-auto">
          <form onSubmit={handleSignUp}>
            <h4 className="text-2xl font-semibold nb-7">SignUp</h4>
            <input
              type="text"
              placeholder="Full Name"
              className="input-box"
              value={name}
              onChange={({ target }) => {
                setName(target.value);
              }}
              disabled={isSubmitting}
              required
            />
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
            <p className="text-xs text-gray-500 mb-3">
              Password must be at least 6 characters with uppercase, lowercase,
              and number
            </p>
            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}
            <button
              type="submit"
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </button>
            <p className="text-x5 text-state-500 text-center my-4">OR</p>

            <button
              type="button"
              className="btn-primary btn-light"
              onClick={() => navigate("/login")}
              disabled={isSubmitting}
            >
              LOGIN
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
