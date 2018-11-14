import React, { Component } from "react";
import WelcomeContainer from "./WelcomeContainer";

class DiceButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstRun: this.props.firstRun
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ firstRun: nextProps.firstRun });
  }

  handleButtonClick = event => {
    if (this.props.firstRun) {
      this.props.changeFirstRun();
      console.log("yayy");
    } else {
      console.log("nayyy");
    }
  };

  randDiceIcon = () => {
    const baseName = "fas fa-dice";
    const diceArray = ["", "-one", "-two", "-three", "-four", "-five", "-six"];
    const randInd = Math.floor(Math.random() * diceArray.length);
    return `${baseName}${diceArray[randInd]}`;
  };

  render() {
    const styles = {
      button: {
        fontSize: "2.5rem"
      }
    };
    return (
      <button className="button randomBtn" onClick={this.handleButtonClick}>
        <i
          className={
            this.state.firstRun === true ? "fas fa-dice" : this.randDiceIcon()
          }
          style={styles.button}
        />
      </button>
    );
  }
}

export default DiceButton;
