import { useState } from "react";
import axios from "axios";
import ReCAPTCHA from "react-google-recaptcha";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/register", {
        username,
        email,
        password,
        captchaToken,
      });
      alert("Registration successful");
    } catch (error) {
      alert("Error registering user");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <ReCAPTCHA
        sitekey={process.env.RECAPTCHA_SITE_KEY}
        onChange={setCaptchaToken}
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
