import { useState, useContext } from "react";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const { setToken, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/signup", form);
      setToken(res.data.token);
      setUser(res.data);
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Name" onChange={(e)=> setForm({...form, name:e.target.value})}/>
        <input placeholder="Email" onChange={(e)=> setForm({...form, email:e.target.value})}/>
        <input placeholder="Password" type="password" onChange={(e)=> setForm({...form, password:e.target.value})}/>
        <button>Signup</button>
      </form>
    </div>
  );
}
