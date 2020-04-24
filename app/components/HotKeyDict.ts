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

const DEFAULT_KEYMAP_GROUP_TAG = "keymapgroup";
const DEFAULT_KEYMAP_DATA_TAG = "keymapdata";
const DEFAULT_KEYMAP_NAME_TAG = "name";
const DEFAULT_KEYMAP_DISPLAY_NAME_TAG = "displayname";
const DEFAULT_KEYMAP_EVENT_TAG = "event";
const DEFAULT_KEYMAP_CONTEXT_TAG = "context";
const DEFAULT_KEYMAP_COMMAND_TAG = "command";

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
                    } else {
                        let hotKeyVal: HotKeyValue = groupSet.get(keyName);
                        hotKeyVal.event = keyEvent;
                        hotKeyVal.prevevent = keyEvent;
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
        const defaultKeyMapGroupList = defaultKeyMap[DEFAULT_KEYMAP_GROUP_TAG];
        defaultKeyMapGroupList.forEach(keyMapGroup => {
            const groupName: string = keyMapGroup["$"]["name"];
            const keyMapDataList = keyMapGroup[DEFAULT_KEYMAP_DATA_TAG];
            if (!this.groups.has(groupName)) {
                this.groups.set(groupName, new Map<string, HotKeyValue>());
            }
            keyMapDataList.forEach(keyMapData => {
                try {
                    // For some reason, these are loaded as arrays
                    let keyName: string = keyMapData[DEFAULT_KEYMAP_NAME_TAG][0];
                    let keyEvent: string = "";
                    if (DEFAULT_KEYMAP_EVENT_TAG in keyMapData) {
                        keyEvent = keyMapData[DEFAULT_KEYMAP_EVENT_TAG][0];
                    }
                    let keyAction: string = "bind"; // Always treat default keymap as bound.
                    this.groups.get(groupName)?.set(keyName, new HotKeyValue(keyName, keyEvent, keyAction));
                } catch(ex) {
                    console.error(ex)
                }
            })
        })
        return this;
    }
}