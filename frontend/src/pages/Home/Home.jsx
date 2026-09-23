import { useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodDisplay from "../../components/FoodDisplay/FoodDisplay";
import CouponGenerator from "../../components/CouponGenerator/CouponGenerator";

const Home = () => {
  const location = useLocation();
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showButton, setShowButton] = useState(false);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const section = document.getElementById("food-display");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };
 
  useEffect(() => {
      if (location.state?.scrollTo){
        const section = document.getElementById(location.state?.scrollTo);
        if(section){
          setTimeout(()=> {
            section.scrollIntoView({behavior: "smooth"});
          }, 200);
        }
      }
    }, [location.state]);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const shouldScroll = localStorage.getItem("scrollToMenu");
    if (shouldScroll === "true") {
      const section = document.getElementById("explore-menu");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
      localStorage.removeItem("scrollToMenu");
    }
  }, []);

  return (
    <div className="home-page">
      <Header searchQuery={searchQuery} onSearch={handleSearch} />
      <CouponGenerator />
      <ExploreMenu category={category} setCategory={setCategory} />
      <FoodDisplay category={category} setCategory={setCategory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
    </div>
  );
};

export default Home;
