import React, { Component } from "react";
import "./App.css";
import NavBar from "./components/NavBar";
import SearchBar from "./components/SearchBar"

class App extends Component {
  render() {
    return (
      <div className="App">
        <NavBar />
        <h1>Welcome to DinnerTonight!</h1>
      </div>
    );
  }
}

export default App;
