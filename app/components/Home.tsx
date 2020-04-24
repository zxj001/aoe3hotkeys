import React from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
// import styles from './Home.css';
import KeyMapPage from './KeyMap';

const path = window.require('path')
const fs = window.require('fs')
const xml2js = window.require('xml2js')
const homedir = window.require('os').homedir();

const isXmlFile = (filePath: string) => {
  return path.extname(filePath).toLowerCase() == ".xml";
}

const isUserProfile = (xmlObject: Object) => {
return "Profile" in xmlObject && xmlObject["Profile"]["$"]["GameID"] === "2" &&
    "KeyMapGroups" in xmlObject["Profile"]
}

const getKeyMapGroups = (xmlObject: Object) => {
  if (xmlObject && "Profile" in xmlObject && xmlObject["Profile"]["$"]["GameID"] === "2") {
    return xmlObject["Profile"]["KeyMapGroups"];
  }
  console.log("Invalid UserProfile")
  return undefined;
}

const printKeyMap = (keyMap: Object) => {
  if (keyMap) {
    return JSON.stringify(keyMap);
  }
}

class Home extends React.Component {

  constructor(props: Object) {
    super(props);
    this.loadUserProfile.bind(this);

    this.state = {KeyMapGroups:undefined}
   }

  loadUserProfile() {
      // Load hotkeyfile
      const aoe3UserDir = path.join(homedir, "Documents/My Games/Age of Empires 3/Users3")
      console.log(aoe3UserDir)

      try {
          if (fs.existsSync(aoe3UserDir)) {
              console.log("Age of Empires 3 user directory exists.")
          } else {
              console.log("Directory does not exist.")
              // TODO prompt user
          }
      } catch (e) {
          console.log("An error occurred.")
          // TODO prompt user
      }

      let userFiles = fs.readdirSync(aoe3UserDir)
      let xmlFiles = []
      for (let filePath of userFiles) {
          if (isXmlFile(filePath)) {
              xmlFiles.push(path.join(aoe3UserDir, filePath))
              console.log("XML file found: " + filePath)
          }
      }

      // TODO allow user to select if it's ambiguous which file to pick
      if (xmlFiles.length == 0) {
          console.log("Error, not user files. Please play Age of Empires 3 at least once.")
          return;
      }

      // Parse the XML
      let userFilePath = xmlFiles[0];
      let parser = new xml2js.Parser();
      console.log(userFilePath)

      // The user profile XML file is UTf-16 encoded
      let userProfileData = fs.readFileSync(userFilePath, "UCS-2")
      console.log(userProfileData)
      const handleUserProfileLoading = (error, result) => {
          // console.dir(result);
          console.log('Done');
          let keyMap = getKeyMapGroups(result)
          if (keyMap) {
            this.setState({UserProfile : result});
            console.dir(result);
            console.log("Saved UserProfile")
          } else {
            console.log("Invalid UserProfile")
          }
      }
      handleUserProfileLoading.bind(this);
      parser.parseString(userProfileData, handleUserProfileLoading);
  }

  componentDidMount() {
    this.loadUserProfile();
  }

  render() {
    return (
      <div>
        <h2>Age of Empires 3 Hotkey Editor</h2>
        <Link to={routes.COUNTER}>to Counter</Link>
        <KeyMapPage keymap={getKeyMapGroups(this.state.UserProfile)}/>
      </div>
    );
  }
}

export default Home;