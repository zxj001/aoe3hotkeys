import React from 'react';
import {HotKeyDict, HotKeyValue} from './HotKeyDict';

const path = window.require('path')
const fs = window.require('fs')
const xml2js = window.require('xml2js')
const homedir = window.require('os').homedir();

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
        console.log("check keymap");
        console.dir(new HotKeyDict(this.props.keymap));
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