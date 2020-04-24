export class HotKeyValue {
    name: string;
    event: string;
    defaultevent: string;
    prevevent: string;
    action: string;
    constructor(name: string, event: string, action: string) {
        this.name = name;
        this.event = event;
        this.defaultevent = event;
        this.prevevent = event;
        this.action = action;
    }
}

export class HotKeyDict {
    groups: Map<string, Map<string, HotKeyValue>>;

    // From the user profile XML file
    constructor() {
        this.groups = new Map();
    }

    fromUserKeyMap(rawUserKeyMap) {
        if (!rawUserKeyMap) {
            console.error("ERROR: User key map invalid.");
            return this;
        }
        let groupList: Array = rawUserKeyMap[0]["Group"];
        if (!groupList) {
            console.error("ERROR: No group list found in user keymap.");
            return this;
        }
        groupList.forEach((group) => {
            const groupName = group["$"]["Name"];
            const keyMapList = group["KeyMap"];
            if (!(this.groups.has(groupName))) {
                this.groups.set(groupName, new Map<string, HotKeyValue>());
                console.error("ERROR: User key map should not have groups not found in default keymap");
            }
            if (!keyMapList) {
                return this;
            }
            keyMapList.forEach((keyMap) => {
                // For some reason, these are loaded as arrays
                let keyName: string = keyMap["Name"][0];
                let keyEvent: string = keyMap["Event"][0];
                let keyAction: string = keyMap["Action"][0];
                let groupSet = this.groups.get(groupName);
                if (groupSet) {
                    if (!groupSet.has(keyName)) {
                        console.error("ERROR: Key [" + keyName + "] Not found in group: [" + groupName + "] | " + groupSet.get(keyName));
                        console.dir(groupSet);
                        console.dir(this.groups);
                        console.log(keyName)
                        console.log(keyEvent)
                    } else {
                        let hotKeyVal: HotKeyValue = groupSet.get(keyName);
                        hotKeyVal.event = keyEvent;
                    }
                } else {
                    console.error("Group not found. " + groupName);
                }
            });
        });
        return this;
    }

    // From the defaultkeymap.xml file (DefaultKeyMap tag)
    fromDefaultKeyMap(defaultKeyMap) {
        if (!defaultKeyMap) {
            return this;
        }
        const defaultKeyMapGroupList = defaultKeyMap["KeyMapGroup"];
        defaultKeyMapGroupList.forEach(keyMapGroup => {
            const groupName: string = keyMapGroup["$"]["name"];
            const keyMapDataList = keyMapGroup["KeyMapData"];
            if (!this.groups.has(groupName)) {
                this.groups.set(groupName, new Map<string, HotKeyValue>());
            }
            keyMapDataList.forEach(keyMap => {
                // For some reason, these are loaded as arrays
                let keyName: string = keyMap["Name"][0];
                let keyEvent: string = keyMap["Event"][0];
                let keyAction: string = "bind"; // Always treat default keymap as bound.
                this.groups.get(groupName)?.set(keyName, new HotKeyValue(keyName, keyEvent, keyAction));
            })
        })
        return this;
    }
}