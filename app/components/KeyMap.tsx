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
            kmList.push(<KeyMap_Key keyval={km} key={i} />);
        });
        return kmList;
    }

    render() {
        return this.groupList();
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
            this.state = { keyMapGroups: groupObject };
            console.log("Saved state");
        } else {
            console.log("Failed to load keymap. (constructor)")
        }
    }

    getGroupName(group) {
        return group["$"]["Name"];
    }

    getGroupKeyMap(group) {
        return group["KeyMap"];
    }

    keysList(groupKeyMapList: Array<Object>, groupName: string, index_offset: number) {
        let kmList = [];
        if (!groupKeyMapList || groupKeyMapList.length <= 0 || !groupName || index_offset < 0) {
            return [];
        }
        groupKeyMapList.forEach((km, i) => {
            kmList.push(
                <tr>
                    <td>{groupName}</td>
                    <td>{km["Name"]}</td>
                    <td>{km["Event"]}</td>
                    <td>{km["Action"]}</td>
                </tr>
            );
        });
        return kmList;
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
            let groupRowOffset = 0;
            groupObject.forEach((group, i) => {
                let keyList = this.getGroupKeyMap(group);
                const groupName = this.getGroupName(group);
                groupList.push(this.keysList(keyList, groupName, groupRowOffset));
                groupRowOffset += keyList.length;
            })
        }
        return groupList;
    }

    render() {
        return (
            <table className="overflow-auto vh-75 table">
                <thead>
                    <tr>
                        <th scope="col">Group</th>
                        <th scope="col">Name</th>
                        <th scope="col">Event</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {this.groupList()}
                </tbody>
            </table>
        );
    }
}

export default KeyMapPage;