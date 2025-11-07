import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import cleaning from "../../images/cleaning.png";
import plumbing from "../../images/plumbing.png";
import electrician from "../../images/electrician.png";
import painting from "../../images/painting.png";



const HomePage = ({ customer, onExploreClick }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!customer;

  const services = [
  { name: "Cleaning", img: cleaning },
  { name: "Plumbing", img: plumbing },
  { name: "Electrician", img: electrician },
  { name: "Painting", img: painting },
];


  return (
    <div>Home</div>
  )
}

export default Home