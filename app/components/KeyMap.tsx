import React from 'react';

import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import { POINT_CONVERSION_COMPRESSED } from 'constants';

const path = window.require('path')
const fs = window.require('fs')
const xml2js = window.require('xml2js')
const homedir = window.require('os').homedir();

class KeyMap_Group extends React.Component {
    constructor(props: Object) {
        super(props);
        console.dir(props.group)
        console.log("try get group")
        // this.state = { group: props.group };
        this.groupList.bind(this);
        this.getName.bind(this);
        this.getKeyMap.bind(this);
        this.render.bind(this);
    }

    getName() {
        return this.props.group["$"]["Name"];
    }

    getKeyMap() {
        return this.props.group["KeyMap"];
    }

    groupList() {
        let kmList = [];
        if (!this.props || !this.props.group) {
            return [];
        }
        this.getKeyMap().forEach((km, i) => {
            kmList.push(<KeyMap_Key  keyval={km} key={i} />);
        });
        return kmList;
    }

    render() {
        return (
            <div>
                <h2>{this.getName()}</h2>
                {this.groupList()}
            </div>
        );
    }
}

class KeyMap_Key extends React.Component {
    constructor(props: Object) {
        super(props);
        // this.state = { key: props.key };
    }
    render() {
        return (
            <div>
                <p>{this.props.keyval["Name"]}</p>
                <p>{this.props.keyval["Event"]}</p>
                <p>{this.props.keyval["Action"]}</p>
            </div>
        );
    }
}

class KeyMapPage extends React.Component {
    constructor(props: Object) {
        super(props);
        // Operate on first keymap
        console.dir(props.keymap);
        let keymap = props.keymap;
        this.groupList.bind(this);
        this.render.bind(this);
        if (keymap !== undefined && keymap.length > 0 && "Group" in keymap[0]) {
            let groupObject = keymap[0]["Group"];
            console.dir(groupObject);
            this.state = { keyMapGroups: groupObject};
            console.log("Saved state");
        } else {
            console.log("Failed to load keymap. (constructor)")
        }
    }

    groupList() {
        let groupList = [];
        console.dir(this.state);
        // if (!this.state || !this.state.keyMapGroups) {
        //     console.log("Cannot load keymap. (listing)");
        //     return []
        // }
        if (!this.props || !this.props.keymap || this.props.keymap.length <= 0) {
            console.log("Cannot load keymap. (listing)");
            return [];
        }
        let groupObject = this.props.keymap[0]["Group"];
        console.dir(groupObject)
        if (!groupObject) {
            console.log("Cannot load keymap. (listing)");
            return [];
        }
        if (groupObject) {
            groupObject.forEach((group, i) => {
                groupList.push(<KeyMap_Group group={group} key={i}/>);
            })
        }
        return groupList;
    }

    render() {
        return (
            <div className="overflow-auto vh-75">
                {this.groupList()}
            </div>
        );
    }
}

export default KeyMapPage;