import React, { ReactElement } from 'react';
import {HotKeyDict, HotKeyValue} from './HotKeyDict';
import { stringify } from 'querystring';

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

    keysList(groupKeyMapList: Array<HotKeyValue>, groupName: string, conflictingKeys: Map<string, Array<HotKeyValue>>, index_offset: number) {
        let kmList = [];
        if (!groupKeyMapList || groupKeyMapList.length <= 0 || !groupName || index_offset < 0) {
            return [];
        }
        groupKeyMapList.forEach((km, i) => {
            const getTextColor = () => {
                let color = "text-dark";
                if (km.event != km.defaultevent) {
                    color = "text-success";
                }
                if (km.event != km.prevevent) {
                    color = "text-danger";
                }
                return color;
            }
            let conflicts = conflictingKeys.get(km.event);
            let conflictsValue = 0;
            if (conflicts && conflicts.length > 0) {
                conflictsValue = conflicts.length - 1;
            }
            kmList.push(
                <tr key={index_offset+i} className={getTextColor()}>
                    <td>{groupName}</td>
                    <td>{km.name}</td>
                    <td className="text-monospace font-weight-bold">{km.event}</td>
                    <td>{conflictsValue}</td>
                    <td>{km.action}</td>
                </tr>
            );
        });
        return kmList;
    }

    groupList() {
        if (!this.props || !this.props.keymap || this.props.keymap.length <= 0 ||
            !this.props.defaultkeymap || this.props.defaultkeymap.length <= 0) {
            console.log("Cannot load keymap. (listing)");
            return [];
        }
        // TODO Make this less ugly with constructor
        let defaultHotKeyDict = new HotKeyDict().fromDefaultKeyMap(this.props.defaultkeymap);
        console.log("Default key map dict:");
        console.dir(defaultHotKeyDict);
        let hotKeyDict = new HotKeyDict().fromDefaultKeyMap(this.props.defaultkeymap).fromUserKeyMap(this.props.keymap);
        if (!hotKeyDict) {
            console.log("Cannot load keymap. (listing)");
            return [];
        }
        let groupList = [];
        let groupRowOffset = 0;
        let conflictingKeys = new Map<string, Array<HotKeyValue>>();
        hotKeyDict.groups.forEach((keyList, groupName) => {
            keyList.forEach(KeyValue => {
                let conflictList = conflictingKeys.get(KeyValue.event);
                if (!conflictList) {
                    conflictList = new Array<HotKeyValue>();
                    conflictingKeys.set(KeyValue.event, conflictList);
                }
                conflictList.push(KeyValue);
            });
        })

        hotKeyDict.groups.forEach((keyList, groupName) => {
            groupList.push(this.keysList(keyList, groupName, conflictingKeys, groupRowOffset));
            groupRowOffset += keyList.length;
        });
        return groupList;
    }

    render() {
        return (
            <table className="overflow-auto vh-75 table table-striped">
                <thead>
                    <tr>
                        <th scope="col">Group</th>
                        <th scope="col">Name</th>
                        <th scope="col">Event</th>
                        <th scope="col">Conflicts</th>
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